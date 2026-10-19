import { randomUUID } from "node:crypto";
import { emailKey } from "@/lib/customer";
import { getDb } from "@/lib/db";
import { getAvailableStock } from "@/lib/inventory";
import { customerLimitError, purchasedByCustomer } from "@/lib/orders";
import { getProductById } from "@/lib/products";

export type CartLine = { productId: string; quantity: number };

type ReserveResult =
  | { ok: true; checkoutId: string; replacedSessionIds: string[] }
  | { ok: false; error: string };

/**
 * Holds stock for a new checkout until `expiresAt`. A customer only keeps one
 * open checkout: starting a new one releases their previous hold.
 */
export function reserveCheckout(
  email: string,
  lines: CartLine[],
  expiresAt: Date,
): ReserveResult {
  const db = getDb();
  const key = emailKey(email);

  return db
    .transaction((): ReserveResult => {
      // The final email + address check happens when payment completes.
      const purchased = purchasedByCustomer(key, null);
      const available = getAvailableStock({ emailKey: key });

      for (const { productId, quantity } of lines) {
        const product = getProductById(productId);
        if (!product)
          return { ok: false, error: "An item in your cart is unavailable." };
        const already = purchased.get(productId) ?? 0;
        if (already + quantity > product.maxPerCustomer) {
          return { ok: false, error: customerLimitError(productId, already) };
        }
        const left = available.get(productId) ?? 0;
        if (left < quantity) {
          return {
            ok: false,
            error:
              left === 0
                ? `${product.name} is sold out.`
                : `Only ${left} ${product.name} left. Please lower the quantity.`,
          };
        }
      }

      const replaced = db
        .prepare(
          `UPDATE checkouts SET status = 'released'
           WHERE email_key = ? AND status = 'open'
           RETURNING stripe_session_id AS sessionId`,
        )
        .all(key) as { sessionId: string | null }[];

      const checkoutId = randomUUID();
      db.prepare(
        "INSERT INTO checkouts (id, email, email_key, status, expires_at) VALUES (?, ?, ?, 'open', ?)",
      ).run(checkoutId, email, key, expiresAt.toISOString());
      const insertItem = db.prepare(
        "INSERT INTO checkout_items (checkout_id, product_id, quantity) VALUES (?, ?, ?)",
      );
      for (const line of lines) {
        insertItem.run(checkoutId, line.productId, line.quantity);
      }

      return {
        ok: true,
        checkoutId,
        replacedSessionIds: replaced.flatMap((r) => r.sessionId ?? []),
      };
    })
    .immediate();
}

export function attachStripeSession(checkoutId: string, sessionId: string) {
  getDb()
    .prepare("UPDATE checkouts SET stripe_session_id = ? WHERE id = ?")
    .run(sessionId, checkoutId);
}

export function releaseCheckout(checkoutId: string) {
  getDb()
    .prepare(
      "UPDATE checkouts SET status = 'released' WHERE id = ? AND status = 'open'",
    )
    .run(checkoutId);
}

export function markCheckoutExpired(sessionId: string) {
  getDb()
    .prepare(
      "UPDATE checkouts SET status = 'expired' WHERE stripe_session_id = ? AND status = 'open'",
    )
    .run(sessionId);
}
