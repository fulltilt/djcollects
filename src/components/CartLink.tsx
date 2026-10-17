"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";

export function CartLink() {
  const { count } = useCart();
  return (
    <Link
      href="/cart"
      className="relative hover:text-stone-900"
      aria-label={`Cart, ${count} items`}
    >
      Cart
      {count > 0 && (
        <span className="ml-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-stone-900 px-1.5 text-xs text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
