import type Stripe from "stripe";
import { getDb } from "@/lib/db";

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

// Idempotent: Stripe may deliver the same webhook more than once.
export function recordPaidOrder(
  session: Stripe.Checkout.Session,
  items: OrderItemInput[],
) {
  const db = getDb();
  const shipping = session.collected_information?.shipping_details;

  return db.transaction(() => {
    const order = db
      .prepare(
        `INSERT INTO orders (
           stripe_session_id, stripe_payment_intent_id, status, email, customer_name,
           shipping_address, amount_subtotal, amount_total, currency
         ) VALUES (?, ?, 'paid', ?, ?, ?, ?, ?, ?)
         ON CONFLICT (stripe_session_id) DO NOTHING
         RETURNING id`,
      )
      .get(
        session.id,
        idOf(session.payment_intent),
        session.customer_details?.email ?? null,
        shipping?.name ?? session.customer_details?.name ?? null,
        shipping ? JSON.stringify(shipping.address) : null,
        session.amount_subtotal ?? 0,
        session.amount_total ?? 0,
        session.currency ?? "usd",
      ) as { id: number } | undefined;

    if (!order) return { created: false };

    const insertItem = db.prepare(
      `INSERT INTO order_items (order_id, product_id, name, quantity, unit_amount, amount_total)
       VALUES (?, ?, ?, ?, ?, ?)`,
    );
    for (const item of items) {
      insertItem.run(
        order.id,
        item.productId,
        item.name,
        item.quantity,
        item.unitAmount,
        item.amountTotal,
      );
    }
    return { created: true, orderId: order.id };
  })();
}

export function markOrderRefunded(charge: Stripe.Charge) {
  const paymentIntentId = idOf(charge.payment_intent);
  if (!paymentIntentId) return;
  const status =
    charge.amount_refunded >= charge.amount ? "refunded" : "partially_refunded";
  getDb()
    .prepare("UPDATE orders SET status = ? WHERE stripe_payment_intent_id = ?")
    .run(status, paymentIntentId);
}
