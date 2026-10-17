import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getOrderBySession } from "@/lib/orders";
import { formatPrice } from "@/lib/products";
import { getStripe } from "@/lib/stripe";
import { ClearCart } from "@/components/ClearCart";

export const metadata: Metadata = {
  title: "Order confirmed",
  robots: { index: false },
};

export default function SuccessPage({
  searchParams,
}: PageProps<"/checkout/success">) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-24 text-center">
      <h1 className="text-4xl font-semibold tracking-tight">Thank you!</h1>
      <Suspense
        fallback={<p className="mt-4 text-stone-600">Confirming your order…</p>}
      >
        <OrderSummary searchParams={searchParams} />
      </Suspense>
      <Link
        href="/shop"
        className="mt-10 inline-block rounded-full bg-stone-900 px-6 py-3 text-white"
      >
        Continue shopping
      </Link>
    </div>
  );
}

async function OrderSummary({
  searchParams,
}: Pick<PageProps<"/checkout/success">, "searchParams">) {
  const { session_id } = await searchParams;
  const session =
    typeof session_id === "string" && session_id.startsWith("cs_")
      ? await getStripe()
          .checkout.sessions.retrieve(session_id)
          .catch(() => null)
      : null;
  if (session?.status !== "complete") {
    return (
      <p className="mt-4 text-stone-600">
        We couldn&apos;t find your order details.
      </p>
    );
  }

  // The webhook may not have processed the order yet.
  const order = getOrderBySession(session.id);
  if (order?.status === "rejected") {
    return (
      <p className="mt-4 text-stone-600">
        We couldn&apos;t complete your order. {order.rejectionReason} You have
        not been charged.
      </p>
    );
  }
  const email = session.customer_details?.email;
  if (order?.status !== "paid") {
    return (
      <>
        <ClearCart />
        <p className="mt-4 text-stone-600">
          We&apos;re confirming your order.
          {email && <> A receipt will be sent to {email} shortly.</>}
        </p>
      </>
    );
  }
  return (
    <>
      <ClearCart />
      <p className="mt-4 text-stone-600">
        Your order of{" "}
        {formatPrice(session.amount_total ?? 0, session.currency ?? "usd")} is
        confirmed.
        {email && <> A receipt is on its way to {email}.</>}
      </p>
    </>
  );
}
