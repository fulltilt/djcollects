import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { addressKey, emailKey } from "@/lib/customer";

// Single SQLite file. Fine for one server; move to Postgres if you run multiple instances.
const DB_PATH =
  process.env.DATABASE_PATH ?? path.join(process.cwd(), "data", "store.db");

type DB = Database.Database;

// Append-only: never edit a shipped migration, add a new one instead.
const migrations: ((db: DB) => void)[] = [
  (db) => {
    db.exec(`
      CREATE TABLE subscribers (
        id         INTEGER PRIMARY KEY,
        email      TEXT NOT NULL UNIQUE,
        source     TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
      );

      CREATE TABLE orders (
        id                       INTEGER PRIMARY KEY,
        stripe_session_id        TEXT NOT NULL UNIQUE,
        stripe_payment_intent_id TEXT,
        status                   TEXT NOT NULL,
        email                    TEXT,
        customer_name            TEXT,
        shipping_address         TEXT,
        amount_subtotal          INTEGER NOT NULL,
        amount_total             INTEGER NOT NULL,
        currency                 TEXT NOT NULL,
        created_at               TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        fulfilled_at             TEXT
      );
      CREATE INDEX orders_payment_intent ON orders (stripe_payment_intent_id);

      CREATE TABLE order_items (
        id           INTEGER PRIMARY KEY,
        order_id     INTEGER NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
        product_id   TEXT,
        name         TEXT NOT NULL,
        quantity     INTEGER NOT NULL,
        unit_amount  INTEGER NOT NULL,
        amount_total INTEGER NOT NULL
      );
      CREATE INDEX order_items_order ON order_items (order_id);
    `);

    // One-time import from the previous JSON file store.
    const legacy = path.join(path.dirname(DB_PATH), "subscribers.json");
    if (fs.existsSync(legacy)) {
      const rows = JSON.parse(fs.readFileSync(legacy, "utf8")) as {
        email: string;
        source: string;
        createdAt: string;
      }[];
      const insert = db.prepare(
        "INSERT OR IGNORE INTO subscribers (email, source, created_at) VALUES (?, ?, ?)",
      );
      for (const r of rows) insert.run(r.email, r.source, r.createdAt);
    }
  },
  (db) => {
    db.exec(`
      -- Stock lives here, not in code. Products without a row are treated as 0 on hand.
      CREATE TABLE inventory (
        product_id TEXT PRIMARY KEY,
        on_hand    INTEGER NOT NULL DEFAULT 0 CHECK (on_hand >= 0),
        updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
      );

      -- One row per Stripe Checkout attempt. Open + unexpired rows hold stock;
      -- abandoned ones are kept for future recovery emails.
      CREATE TABLE checkouts (
        id                TEXT PRIMARY KEY,
        stripe_session_id TEXT UNIQUE,
        email             TEXT NOT NULL,
        email_key         TEXT NOT NULL,
        status            TEXT NOT NULL,
        expires_at        TEXT NOT NULL,
        created_at        TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
      );
      CREATE INDEX checkouts_status_expires ON checkouts (status, expires_at);
      CREATE INDEX checkouts_email_key ON checkouts (email_key);

      CREATE TABLE checkout_items (
        checkout_id TEXT NOT NULL REFERENCES checkouts (id) ON DELETE CASCADE,
        product_id  TEXT NOT NULL,
        quantity    INTEGER NOT NULL CHECK (quantity > 0),
        PRIMARY KEY (checkout_id, product_id)
      );

      ALTER TABLE orders RENAME COLUMN fulfilled_at TO shipped_at;
      ALTER TABLE orders ADD COLUMN checkout_id TEXT REFERENCES checkouts (id);
      ALTER TABLE orders ADD COLUMN stripe_customer_id TEXT;
      ALTER TABLE orders ADD COLUMN email_key TEXT;
      ALTER TABLE orders ADD COLUMN address_key TEXT;
      ALTER TABLE orders ADD COLUMN amount_shipping INTEGER NOT NULL DEFAULT 0;
      ALTER TABLE orders ADD COLUMN amount_tax INTEGER NOT NULL DEFAULT 0;
      ALTER TABLE orders ADD COLUMN amount_discount INTEGER NOT NULL DEFAULT 0;
      ALTER TABLE orders ADD COLUMN promo_code TEXT;
      ALTER TABLE orders ADD COLUMN rejection_reason TEXT;
      ALTER TABLE orders ADD COLUMN carrier TEXT;
      ALTER TABLE orders ADD COLUMN tracking_number TEXT;
      ALTER TABLE orders ADD COLUMN delivered_at TEXT;
      ALTER TABLE orders ADD COLUMN notes TEXT;
      CREATE INDEX orders_email_key ON orders (email_key);
      CREATE INDEX orders_address_key ON orders (address_key);

      -- Audit trail for support and chargeback disputes.
      CREATE TABLE order_events (
        id         INTEGER PRIMARY KEY,
        order_id   INTEGER NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
        type       TEXT NOT NULL,
        detail     TEXT,
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
      );
      CREATE INDEX order_events_order ON order_events (order_id);
    `);

    const rows = db
      .prepare("SELECT id, email, shipping_address FROM orders")
      .all() as { id: number; email: string | null; shipping_address: string | null }[];
    const update = db.prepare(
      "UPDATE orders SET email_key = ?, address_key = ? WHERE id = ?",
    );
    for (const r of rows) {
      update.run(
        r.email ? emailKey(r.email) : null,
        r.shipping_address ? addressKey(JSON.parse(r.shipping_address)) : null,
        r.id,
      );
    }
  },
];

function migrate(db: DB) {
  const current = db.pragma("user_version", { simple: true }) as number;
  for (let v = current; v < migrations.length; v++) {
    db.transaction(() => {
      migrations[v](db);
      db.pragma(`user_version = ${v + 1}`);
    })();
  }
}

// Reuse the connection across dev hot reloads.
const globalForDb = globalThis as unknown as { db?: DB };

export function getDb(): DB {
  if (!globalForDb.db) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    const db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    db.pragma("busy_timeout = 5000");
    migrate(db);
    globalForDb.db = db;
  }
  return globalForDb.db;
}
