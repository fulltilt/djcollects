"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { cart, useCart } from "@/lib/cart";
import { formatPrice, getProductById } from "@/lib/products";

export function CartView() {
  const { items, subtotalCents } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function checkout() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const data = await res.json();
      if (!res.ok || !data.url)
        throw new Error(data.error ?? "Checkout failed.");
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed.");
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="mt-10">
        <p className="text-stone-600">Your cart is empty.</p>
        <Link
          href="/shop"
          className="mt-6 inline-block rounded-full bg-stone-900 px-6 py-3 text-white"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_320px]">
      <ul className="divide-y divide-stone-200 border-y border-stone-200">
        {items.map((item) => {
          const product = getProductById(item.productId);
          if (!product) return null;
          const image = product.images[0];
          return (
            <li key={item.productId} className="flex gap-6 py-6">
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-stone-100">
                {image && (
                  <Image
                    src={image.src}
                    alt={image.alt}
                    width={96}
                    height={96}
                    unoptimized={image.src.endsWith(".svg")}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="flex flex-1 flex-col">
                <div className="flex justify-between gap-4">
                  <Link
                    href={`/products/${product.slug}`}
                    className="font-medium hover:underline"
                  >
                    {product.name}
                  </Link>
                  <p>{formatPrice(product.priceCents * item.quantity)}</p>
                </div>
                <div className="mt-auto flex items-center gap-4 text-sm">
                  <label className="flex items-center gap-2">
                    <span className="text-stone-500">Qty</span>
                    <select
                      value={item.quantity}
                      onChange={(e) =>
                        cart.setQuantity(product.id, Number(e.target.value))
                      }
                      className="rounded-lg border border-stone-300 px-2 py-1"
                    >
                      {Array.from(
                        { length: product.maxPerOrder },
                        (_, i) => i + 1,
                      ).map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    type="button"
                    onClick={() => cart.remove(product.id)}
                    className="text-stone-500 hover:text-stone-900"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <aside className="h-fit rounded-2xl bg-stone-50 p-6">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span className="font-medium">{formatPrice(subtotalCents)}</span>
        </div>
        <p className="mt-2 text-sm text-stone-500">
          Shipping and taxes calculated at checkout.
        </p>
        <button
          type="button"
          onClick={checkout}
          disabled={loading}
          className="mt-6 w-full rounded-full bg-stone-900 px-6 py-3 font-medium text-white transition hover:bg-stone-700 disabled:opacity-60"
        >
          {loading ? "Redirecting…" : "Checkout"}
        </button>
        {error && (
          <p role="alert" className="mt-3 text-sm text-red-600">
            {error}
          </p>
        )}
      </aside>
    </div>
  );
}
