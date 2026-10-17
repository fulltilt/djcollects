import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { categories, getCategory, getProductsInCategory } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/categories/[slug]">): Promise<Metadata> {
  const category = getCategory((await params).slug);
  return category
    ? { title: category.name, description: category.description }
    : {};
}

export default async function CategoryPage({
  params,
}: PageProps<"/categories/[slug]">) {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();
  const items = getProductsInCategory(slug);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <Link
        href="/shop"
        className="text-sm text-stone-500 hover:text-stone-900"
      >
        ← All products
      </Link>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight">
        {category.name}
      </h1>
      <p className="mt-3 max-w-2xl text-stone-600">{category.description}</p>
      <div className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      {items.length === 0 && (
        <p className="mt-10 text-stone-500">
          Nothing here yet.{" "}
          <Link href="/#join" className="underline hover:text-stone-900">
            Join the list
          </Link>{" "}
          to hear when new {category.name.toLowerCase()} drop.
        </p>
      )}
    </div>
  );
}
