import type Stripe from "stripe";
import { getProductById } from "@/lib/products";
import { site } from "@/lib/site";
import { getStripe } from "@/lib/stripe";

type RequestedItem = { productId: unknown; quantity: unknown };

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
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

  // Prices always come from the server-side catalog, never from the client.
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  for (const item of body.items) {
    const product =
      typeof item.productId === "string"
        ? getProductById(item.productId)
        : undefined;
    const quantity = Number(item.quantity);
    if (!product?.inStock) {
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

  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: `${site.url}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${site.url}/cart`,
      shipping_address_collection: { allowed_countries: ["US"] },
      billing_address_collection: "auto",
      allow_promotion_codes: true,
    });
    return Response.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error", err);
    return Response.json(
      { error: "Could not start checkout. Please try again." },
      { status: 500 },
    );
  }
}
