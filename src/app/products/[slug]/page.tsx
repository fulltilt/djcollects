import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  formatPrice,
  getCategory,
  getProductBadges,
  getProductBySlug,
  getProductSpecs,
  products,
} from "@/lib/products";
import { site } from "@/lib/site";
import { AddToCartButton } from "@/components/AddToCartButton";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/products/[slug]">): Promise<Metadata> {
  const product = getProductBySlug((await params).slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.tagline,
    openGraph: { images: product.images.map((i) => i.src) },
  };
}

export default async function ProductPage({
  params,
}: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();
  const category = getCategory(product.categorySlug);
  const image = product.images[0];

  // Structured data so search engines can show price/availability.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.tagline,
    category: category?.name,
    image: product.images.map((i) => new URL(i.src, site.url).toString()),
    offers: {
      "@type": "Offer",
      price: (product.priceCents / 100).toFixed(2),
      priceCurrency: site.currency.toUpperCase(),
      itemCondition:
        product.kind === "sealed"
          ? "https://schema.org/NewCondition"
          : "https://schema.org/UsedCondition",
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: new URL(`/products/${product.slug}`, site.url).toString(),
    },
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replaceAll("<", String.raw`\u003c`),
        }}
      />
      <nav className="text-sm text-stone-500">
        <Link href="/shop" className="hover:text-stone-900">
          Shop
        </Link>
        {category && (
          <>
            {" / "}
            <Link
              href={`/categories/${category.slug}`}
              className="hover:text-stone-900"
            >
              {category.name}
            </Link>
          </>
        )}
      </nav>

      <div className="mt-8 grid gap-12 md:grid-cols-2">
        <div className="aspect-square overflow-hidden rounded-3xl bg-stone-100">
          {image && (
            <Image
              src={image.src}
              alt={image.alt}
              width={800}
              height={800}
              preload
              unoptimized={image.src.endsWith(".svg")}
              className="h-full w-full object-cover"
            />
          )}
        </div>

        <div>
          <div className="flex gap-2">
            {getProductBadges(product).map((b) => (
              <span
                key={b}
                className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700"
              >
                {b}
              </span>
            ))}
          </div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">
            {product.name}
          </h1>
          <p className="mt-2 text-lg text-stone-600">{product.tagline}</p>
          <p className="mt-6 text-2xl">{formatPrice(product.priceCents)}</p>

          <div className="mt-8">
            <AddToCartButton product={product} />
            {product.inStock && product.maxPerOrder <= 5 && (
              <p className="mt-3 text-center text-sm text-stone-500">
                Limit {product.maxPerOrder} per customer
              </p>
            )}
          </div>

          <dl className="mt-10 divide-y divide-stone-200 border-y border-stone-200 text-sm">
            {getProductSpecs(product).map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 py-3">
                <dt className="text-stone-500">{label}</dt>
                <dd className="text-right font-medium">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-10 space-y-4 text-stone-700">
            {product.description.map((para) => (
              <p key={para}>{para}</p>
            ))}
          </div>

          <ul className="mt-8 space-y-2 border-t border-stone-200 pt-8 text-sm text-stone-600">
            {product.features.map((f) => (
              <li key={f}>✓ {f}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
