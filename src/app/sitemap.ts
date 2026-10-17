import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";
import { categories, products } from "@/lib/products";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const url = (path: string) => new URL(path, site.url).toString();
  return [
    ...["/", "/shop", "/about", "/blog", "/privacy", "/terms"].map((p) => ({
      url: url(p),
    })),
    ...products.map((p) => ({ url: url(`/products/${p.slug}`) })),
    ...categories.map((c) => ({ url: url(`/categories/${c.slug}`) })),
    ...getAllPosts().map((p) => ({
      url: url(`/blog/${p.slug}`),
      lastModified: p.date,
    })),
  ];
}
