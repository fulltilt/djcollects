import { isAdminRequest } from "@/lib/admin";
import {
  getAvailableStock,
  getOnHand,
  revalidateInventory,
  setOnHand,
} from "@/lib/inventory";
import { getProductById, products } from "@/lib/products";

// View stock:
//   curl -H "Authorization: Bearer $ADMIN_TOKEN" https://yourdomain.com/api/admin/inventory
// Set units on hand:
//   curl -X PUT -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json" \
//     -d '{"productId":"storm-emeralda-booster-box","onHand":12}' https://yourdomain.com/api/admin/inventory

function snapshot() {
  const onHand = getOnHand();
  const available = getAvailableStock();
  return products.map((p) => ({
    productId: p.id,
    name: p.name,
    onHand: onHand.get(p.id) ?? 0,
    available: available.get(p.id) ?? 0,
  }));
}

export async function GET(request: Request) {
  if (!isAdminRequest(request)) {
    return new Response("Unauthorized", { status: 401 });
  }
  return Response.json(snapshot(), {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function PUT(request: Request) {
  if (!isAdminRequest(request)) {
    return new Response("Unauthorized", { status: 401 });
  }
  const body = (await request.json().catch(() => null)) as {
    productId?: unknown;
    onHand?: unknown;
  } | null;
  const product =
    typeof body?.productId === "string"
      ? getProductById(body.productId)
      : undefined;
  const onHand = Number(body?.onHand);
  if (!product) {
    return Response.json({ error: "Unknown productId." }, { status: 400 });
  }
  if (!Number.isInteger(onHand) || onHand < 0 || onHand > 100_000) {
    return Response.json(
      { error: "onHand must be a whole number from 0 to 100000." },
      { status: 400 },
    );
  }
  setOnHand(product.id, onHand);
  revalidateInventory();
  return Response.json(snapshot(), {
    headers: { "Cache-Control": "no-store" },
  });
}
