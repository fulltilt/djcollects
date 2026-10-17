import type Stripe from "stripe";
import { markOrderRefunded, recordPaidOrder } from "@/lib/orders";
import { getStripe } from "@/lib/stripe";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !secret) {
    return new Response("Missing signature", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    // Signature verification needs the raw, unparsed body.
    event = getStripe().webhooks.constructEvent(
      await request.text(),
      signature,
      secret,
    );
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object;
        if (session.payment_status === "paid") await saveOrder(session);
        break;
      }
      case "charge.refunded":
        markOrderRefunded(event.data.object);
        break;
    }
  } catch (err) {
    console.error("Webhook handling failed", event.type, event.id, err);
    // Non-2xx makes Stripe retry later.
    return new Response("Webhook handler error", { status: 500 });
  }

  return Response.json({ received: true });
}

async function saveOrder(session: Stripe.Checkout.Session) {
  const lineItems = await getStripe()
    .checkout.sessions.listLineItems(session.id, {
      limit: 100,
      expand: ["data.price.product"],
    })
    .autoPagingToArray({ limit: 1000 });

  const items = lineItems.map((li) => {
    const product = li.price?.product;
    const productId =
      product && typeof product === "object" && !product.deleted
        ? (product.metadata.productId ?? null)
        : null;
    const quantity = li.quantity ?? 1;
    return {
      productId,
      name: li.description ?? "Item",
      quantity,
      unitAmount:
        li.price?.unit_amount ?? Math.round(li.amount_subtotal / quantity),
      amountTotal: li.amount_total,
    };
  });

  const result = recordPaidOrder(session, items);
  if (result.created) {
    // Next steps for fulfillment: send a confirmation email, decrement stock, notify shipping.
    console.log("Order recorded", {
      orderId: result.orderId,
      sessionId: session.id,
    });
  }
}
