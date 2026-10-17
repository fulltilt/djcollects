import type Stripe from "stripe";
import { markCheckoutExpired } from "@/lib/checkouts";
import { revalidateInventory } from "@/lib/inventory";
import { sendMail } from "@/lib/mailer";
import {
  markOrderPaid,
  markOrderRefunded,
  recordCompletedCheckout,
} from "@/lib/orders";
import { site } from "@/lib/site";
import { getStripe } from "@/lib/stripe";

// Enable these events on the Stripe webhook endpoint:
// checkout.session.completed, checkout.session.expired, charge.refunded
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
        await completeCheckout(event.data.object.id);
        break;
      case "checkout.session.expired":
        markCheckoutExpired(event.data.object.id);
        revalidateInventory();
        break;
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

async function completeCheckout(sessionId: string) {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["payment_intent", "discounts.promotion_code"],
  });
  const lineItems = await stripe.checkout.sessions
    .listLineItems(sessionId, { limit: 100, expand: ["data.price.product"] })
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

  const order = recordCompletedCheckout(session, items);
  revalidateInventory();

  // Null when nothing was charged, e.g. a 100% off promo code.
  const pi =
    typeof session.payment_intent === "object" ? session.payment_intent : null;

  if (order.status === "authorized") {
    if (pi?.status === "requires_capture") {
      await stripe.paymentIntents.capture(pi.id);
    }
    markOrderPaid(order.orderId);
    if (order.created) console.log("Order paid", { orderId: order.orderId });
    return;
  }

  if (order.status === "rejected") {
    if (pi?.status === "requires_capture") {
      await stripe.paymentIntents.cancel(pi.id);
    } else if (pi?.status === "succeeded") {
      await stripe.refunds.create(
        { payment_intent: pi.id },
        { idempotencyKey: `reject-${pi.id}` },
      );
    }
    const email = session.customer_details?.email;
    if (order.created && email) {
      await sendMail({
        to: email,
        replyTo: site.contactEmail,
        subject: `We couldn't complete your ${site.name} order`,
        text: [
          "Sorry, we couldn't complete your order:",
          "",
          order.rejectionReason ?? "",
          "",
          "You have not been charged. Any temporary hold on your card will be released by your bank.",
          "",
          `Questions? Reply to this email or contact ${site.contactEmail}.`,
        ].join("\n"),
      });
    }
  }
}
