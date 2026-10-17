import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

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
