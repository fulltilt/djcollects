import Image from "next/image";
import Link from "next/link";
import { formatPrice, getProductBadges, type Product } from "@/lib/products";

export function ProductCard({ product }: { product: Product }) {
  const image = product.images[0];
  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-stone-100">
        {image && (
          <Image
            src={image.src}
            alt={image.alt}
            width={800}
            height={800}
            unoptimized={image.src.endsWith(".svg")}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
        <div className="absolute left-3 top-3 flex gap-1.5">
          {getProductBadges(product).map((b) => (
            <span
              key={b}
              className="rounded-full border border-stone-300 bg-white/90 px-2.5 py-1 text-xs font-medium text-stone-700 shadow-sm"
            >
              {b}
            </span>
          ))}
        </div>
        {!product.inStock && (
          <span className="absolute right-3 top-3 rounded-full bg-stone-900 px-2.5 py-1 text-xs font-medium text-white">
            Sold out
          </span>
        )}
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-4">
        <h3 className="font-medium">{product.name}</h3>
        <p className="text-stone-600">{formatPrice(product.priceCents)}</p>
      </div>
      <p className="mt-1 text-sm text-stone-500">{product.tagline}</p>
    </Link>
  );
}
