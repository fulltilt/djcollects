"use client";

import { useState } from "react";
import { cart } from "@/lib/cart";
import type { Product } from "@/lib/products";

export function AddToCartButton({ product }: { product: Product }) {
  const [added, setAdded] = useState(false);

  if (!product.inStock) {
    return (
      <button
        type="button"
        disabled
        className="w-full rounded-full bg-stone-300 px-6 py-3 text-white"
      >
        Sold out
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        cart.add(product.id);
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
      }}
      className="w-full rounded-full bg-stone-900 px-6 py-3 font-medium text-white transition hover:bg-stone-700"
    >
      {added ? "Added to cart ✓" : "Add to cart"}
    </button>
  );
}
