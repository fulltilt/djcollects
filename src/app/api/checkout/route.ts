import type Stripe from "stripe";
import {
  attachStripeSession,
  releaseCheckout,
  reserveCheckout,
  type CartLine,
} from "@/lib/checkouts";
import { revalidateInventory } from "@/lib/inventory";
import { getProductById } from "@/lib/products";
import { site } from "@/lib/site";
import { getStripe } from "@/lib/stripe";
import { normalizeEmail } from "@/lib/subscribers";

type RequestedItem = { productId: unknown; quantity: unknown };

// Stripe's minimum session lifetime is 30 minutes; the extra minute absorbs clock skew.
const SESSION_TTL_MS = 31 * 60 * 1000;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    email?: unknown;
    items?: RequestedItem[];
  } | null;
  if (
    !body ||
    !Array.isArray(body.items) ||
    body.items.length === 0 ||
    body.items.length > 50
  ) {
    return Response.json({ error: "Your cart is empty." }, { status: 400 });
  }
  const email = normalizeEmail(body.email);
  if (!email) {
    return Response.json(
      { error: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  // Prices always come from the server-side catalog, never from the client.
  const lines: CartLine[] = [];
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  for (const item of body.items) {
    const product =
      typeof item.productId === "string"
        ? getProductById(item.productId)
        : undefined;
    const quantity = Number(item.quantity);
    if (!product || lines.some((l) => l.productId === product.id)) {
      return Response.json(
        { error: "An item in your cart is unavailable." },
        { status: 400 },
      );
    }
    if (
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > product.maxPerOrder
    ) {
      return Response.json({ error: "Invalid quantity." }, { status: 400 });
    }
    lines.push({ productId: product.id, quantity });
    lineItems.push({
      quantity,
      price_data: {
        currency: site.currency,
        unit_amount: product.priceCents,
        product_data: {
          name: product.name,
          description: product.tagline,
          images: product.images
            .filter((i) => !i.src.endsWith(".svg"))
            .map((i) => new URL(i.src, site.url).toString()),
          metadata: { productId: product.id },
        },
      },
    });
  }

  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  const reservation = reserveCheckout(email, lines, expiresAt);
  if (!reservation.ok) {
    return Response.json({ error: reservation.error }, { status: 409 });
  }
  revalidateInventory();

  const stripe = getStripe();
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      customer_email: email,
      customer_creation: "always",
      client_reference_id: reservation.checkoutId,
      metadata: { checkoutId: reservation.checkoutId },
      expires_at: Math.floor(expiresAt.getTime() / 1000),
      // Authorize only; the webhook captures after re-checking stock and customer limits.
      payment_intent_data: {
        capture_method: "manual",
        metadata: { checkoutId: reservation.checkoutId },
      },
      success_url: `${site.url}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${site.url}/cart`,
      shipping_address_collection: { allowed_countries: ["US"] },
      billing_address_collection: "auto",
      allow_promotion_codes: true,
    });
    attachStripeSession(reservation.checkoutId, session.id);

    // Close the customer's older sessions so they can't pay without a hold.
    await Promise.allSettled(
      reservation.replacedSessionIds.map((id) =>
        stripe.checkout.sessions.expire(id),
      ),
    );

    return Response.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error", err);
    releaseCheckout(reservation.checkoutId);
    revalidateInventory();
    return Response.json(
      { error: "Could not start checkout. Please try again." },
      { status: 500 },
    );
  }
}
