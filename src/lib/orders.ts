import type Stripe from "stripe";
import { addressKey, emailKey } from "@/lib/customer";
import { getDb } from "@/lib/db";
import { getAvailableStock } from "@/lib/inventory";
import { getProductById } from "@/lib/products";

export type OrderStatus =
  | "authorized"
  | "paid"
  | "rejected"
  | "refunded"
  | "partially_refunded";

// Orders that count toward a customer's purchase limit.
const COUNTED_STATUSES = "('authorized', 'paid', 'partially_refunded')";

export type OrderItemInput = {
  productId: string | null;
  name: string;
  quantity: number;
  unitAmount: number;
  amountTotal: number;
};

function idOf(ref: string | { id: string } | null) {
  return typeof ref === "string" ? ref : (ref?.id ?? null);
}

function addOrderEvent(orderId: number, type: string, detail?: string | null) {
  getDb()
    .prepare(
      "INSERT INTO order_events (order_id, type, detail) VALUES (?, ?, ?)",
    )
    .run(orderId, type, detail ?? null);
}

/** Units of each product already ordered by this email OR shipping address. */
export function purchasedByCustomer(
  email: string | null,
  address: string | null,
): Map<string, number> {
  const rows = getDb()
    .prepare(
      `SELECT oi.product_id AS productId, SUM(oi.quantity) AS quantity
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       WHERE o.status IN ${COUNTED_STATUSES}
         AND (o.email_key = ? OR o.address_key = ?)
         AND oi.product_id IS NOT NULL
       GROUP BY oi.product_id`,
    )
    .all(email, address) as { productId: string; quantity: number }[];
  return new Map(rows.map((r) => [r.productId, r.quantity]));
}

export function customerLimitError(productId: string, alreadyOrdered: number) {
  const product = getProductById(productId);
  if (!product) return "An item in your cart is unavailable.";
  const limit = `${product.name} is limited to ${product.maxPerCustomer} per customer.`;
  return alreadyOrdered > 0
    ? `${limit} You've already ordered ${alreadyOrdered}.`
    : limit;
}

function rejectionFor(
  items: OrderItemInput[],
  keys: { email: string | null; address: string | null },
  checkoutId: string | null,
): string | null {
  const purchased = purchasedByCustomer(keys.email, keys.address);
  const available = getAvailableStock({ checkoutId });
  for (const item of items) {
    if (!item.productId) continue;
    const product = getProductById(item.productId);
    const already = purchased.get(item.productId) ?? 0;
    if (product && already + item.quantity > product.maxPerCustomer) {
      return customerLimitError(item.productId, already);
    }
    if ((available.get(item.productId) ?? 0) < item.quantity) {
      return `${item.name} sold out before your payment went through.`;
    }
  }
  return null;
}

function promoCodeOf(session: Stripe.Checkout.Session) {
  for (const d of session.discounts ?? []) {
    if (d.promotion_code && typeof d.promotion_code === "object") {
      return d.promotion_code.code;
    }
  }
  return null;
}

export type RecordedOrder = {
  orderId: number;
  status: OrderStatus;
  rejectionReason: string | null;
  created: boolean;
};

/**
 * Checks per-customer limits and stock, then stores the order as either
 * "authorized" (stock decremented, ready to capture) or "rejected".
 * Idempotent: Stripe may deliver the same webhook more than once.
 */
export function recordCompletedCheckout(
  session: Stripe.Checkout.Session,
  items: OrderItemInput[],
): RecordedOrder {
  const db = getDb();

  return db
    .transaction((): RecordedOrder => {
      const existing = db
        .prepare(
          "SELECT id, status, rejection_reason FROM orders WHERE stripe_session_id = ?",
        )
        .get(session.id) as
        | { id: number; status: OrderStatus; rejection_reason: string | null }
        | undefined;
      if (existing) {
        return {
          orderId: existing.id,
          status: existing.status,
          rejectionReason: existing.rejection_reason,
          created: false,
        };
      }

      const checkoutId = session.metadata?.checkoutId ?? null;
      const shipping = session.collected_information?.shipping_details;
      const email =
        session.customer_details?.email ?? session.customer_email ?? null;
      const keys = {
        email: email ? emailKey(email) : null,
        address: addressKey(shipping?.address),
      };
      const rejectionReason = rejectionFor(items, keys, checkoutId);
      const status: OrderStatus = rejectionReason ? "rejected" : "authorized";

      const { id: orderId } = db
        .prepare(
          `INSERT INTO orders (
             stripe_session_id, stripe_payment_intent_id, stripe_customer_id, checkout_id,
             status, rejection_reason, email, email_key, customer_name,
             shipping_address, address_key, amount_subtotal, amount_shipping,
             amount_tax, amount_discount, amount_total, currency, promo_code
           ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           RETURNING id`,
        )
        .get(
          session.id,
          idOf(session.payment_intent),
          idOf(session.customer),
          checkoutId,
          status,
          rejectionReason,
          email,
          keys.email,
          shipping?.name ?? session.customer_details?.name ?? null,
          shipping ? JSON.stringify(shipping.address) : null,
          keys.address,
          session.amount_subtotal ?? 0,
          session.total_details?.amount_shipping ?? 0,
          session.total_details?.amount_tax ?? 0,
          session.total_details?.amount_discount ?? 0,
          session.amount_total ?? 0,
          session.currency ?? "usd",
          promoCodeOf(session),
        ) as { id: number };

      const insertItem = db.prepare(
        `INSERT INTO order_items (order_id, product_id, name, quantity, unit_amount, amount_total)
         VALUES (?, ?, ?, ?, ?, ?)`,
      );
      const decrement = db.prepare(
        "UPDATE inventory SET on_hand = on_hand - ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE product_id = ?",
      );
      for (const item of items) {
        insertItem.run(
          orderId,
          item.productId,
          item.name,
          item.quantity,
          item.unitAmount,
          item.amountTotal,
        );
        if (status === "authorized" && item.productId) {
          decrement.run(item.quantity, item.productId);
        }
      }

      if (checkoutId) {
        db.prepare(
          "UPDATE checkouts SET status = 'completed' WHERE id = ?",
        ).run(checkoutId);
      }
      addOrderEvent(orderId, status, rejectionReason);
      return { orderId, status, rejectionReason, created: true };
    })
    .immediate();
}

export function markOrderPaid(orderId: number) {
  const changed = getDb()
    .prepare(
      "UPDATE orders SET status = 'paid' WHERE id = ? AND status = 'authorized'",
    )
    .run(orderId).changes;
  if (changed) addOrderEvent(orderId, "paid");
}

export function markOrderRefunded(charge: Stripe.Charge) {
  const paymentIntentId = idOf(charge.payment_intent);
  if (!paymentIntentId) return;
  const status: OrderStatus =
    charge.amount_refunded >= charge.amount ? "refunded" : "partially_refunded";
  const order = getDb()
    .prepare(
      "UPDATE orders SET status = ? WHERE stripe_payment_intent_id = ? AND status != 'rejected' RETURNING id",
    )
    .get(status, paymentIntentId) as { id: number } | undefined;
  if (order) {
    addOrderEvent(
      order.id,
      status,
      `Refunded ${charge.amount_refunded} of ${charge.amount}`,
    );
  }
}

export function getOrderBySession(sessionId: string) {
  return getDb()
    .prepare(
      "SELECT status, rejection_reason AS rejectionReason FROM orders WHERE stripe_session_id = ?",
    )
    .get(sessionId) as
    | { status: OrderStatus; rejectionReason: string | null }
    | undefined;
}
