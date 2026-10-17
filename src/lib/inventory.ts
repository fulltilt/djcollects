import { cacheLife, cacheTag, revalidateTag } from "next/cache";
import { getDb } from "@/lib/db";

const INVENTORY_TAG = "inventory";

type Exclude = { checkoutId?: string | null; emailKey?: string | null };

/** On-hand stock minus units held by other open, unexpired checkouts. */
export function getAvailableStock(exclude: Exclude = {}): Map<string, number> {
  const rows = getDb()
    .prepare(
      `SELECT i.product_id AS productId,
              i.on_hand - COALESCE((
                SELECT SUM(ci.quantity)
                FROM checkout_items ci
                JOIN checkouts c ON c.id = ci.checkout_id
                WHERE ci.product_id = i.product_id
                  AND c.status = 'open'
                  AND c.expires_at > @now
                  AND c.id IS NOT @checkoutId
                  AND c.email_key IS NOT @emailKey
              ), 0) AS available
       FROM inventory i`,
    )
    .all({
      now: new Date().toISOString(),
      checkoutId: exclude.checkoutId ?? null,
      emailKey: exclude.emailKey ?? null,
    }) as { productId: string; available: number }[];
  return new Map(rows.map((r) => [r.productId, Math.max(0, r.available)]));
}

/** Cached for page rendering; call revalidateInventory() after any stock change. */
export async function getStockLevels(): Promise<Record<string, number>> {
  "use cache";
  cacheTag(INVENTORY_TAG);
  // Reservations also lapse with time, so don't trust the cache for long.
  cacheLife("minutes");
  return Object.fromEntries(getAvailableStock());
}

export function revalidateInventory() {
  revalidateTag(INVENTORY_TAG, { expire: 0 });
}

export function getOnHand(): Map<string, number> {
  const rows = getDb()
    .prepare("SELECT product_id AS productId, on_hand AS onHand FROM inventory")
    .all() as { productId: string; onHand: number }[];
  return new Map(rows.map((r) => [r.productId, r.onHand]));
}

export function setOnHand(productId: string, onHand: number) {
  getDb()
    .prepare(
      `INSERT INTO inventory (product_id, on_hand) VALUES (?, ?)
       ON CONFLICT (product_id) DO UPDATE SET
         on_hand = excluded.on_hand,
         updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')`,
    )
    .run(productId, onHand);
}
