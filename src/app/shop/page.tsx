import type { Metadata } from "next";
import Link from "next/link";
import { categories, products } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";

export const metadata: Metadata = {
  title: "Shop",
  description: "Browse all products.",
};

export default function ShopPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-4xl font-semibold tracking-tight">Shop</h1>
      <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        We&apos;re currently serving local customers in the Bay Area only.
        Shipping is coming in 2027!
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        <span className="rounded-full bg-stone-900 px-4 py-1.5 text-sm text-white">
          All
        </span>
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/categories/${c.slug}`}
            className="rounded-full border border-stone-300 px-4 py-1.5 text-sm hover:border-stone-900"
          >
            {c.name}
          </Link>
        ))}
      </div>
      <div className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
