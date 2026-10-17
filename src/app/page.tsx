import Image from "next/image";
import Link from "next/link";
import { formatPrice, products } from "@/lib/products";
import { formatDate, getAllPosts } from "@/lib/blog";
import { site } from "@/lib/site";
import { SubscribeForm } from "@/components/SubscribeForm";

export default function Home() {
  const featured = products[0];
  const posts = getAllPosts().slice(0, 3);

  return (
    <>
      <section className="relative overflow-hidden bg-linear-to-b from-stone-100 to-white">
        <div className="mx-auto max-w-6xl px-6 pt-8 md:pt-12">
          <div className="relative overflow-hidden rounded-3xl shadow-xl">
            <Image
              src="/hero-storm-emeralda.webp"
              alt="Storm Emeralda Japanese Pokémon TCG set artwork featuring Rayquaza"
              width={2000}
              height={552}
              preload
              sizes="(min-width: 1152px) 1104px, 100vw"
              className="aspect-2/1 w-full object-cover object-right md:aspect-auto"
            />
            <Link
              href="/shop"
              className="absolute bottom-4 left-4 rounded-full bg-stone-900 px-10 py-4 text-lg font-semibold uppercase tracking-wider text-white shadow-2xl ring-4 ring-white/80 transition hover:scale-105 hover:bg-stone-700 md:bottom-10 md:left-10 md:px-14 md:py-5 md:text-2xl"
            >
              Shop
            </Link>
          </div>
        </div>
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <p className="text-sm font-medium uppercase tracking-widest text-stone-500">
            Imported from Japan
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
            {site.tagline}
          </h1>
          <p className="mt-6 max-w-md text-lg text-stone-600">
            {site.description}
          </p>
        </div>
      </section>

      {featured && (
        <section className="mx-auto max-w-6xl px-6 py-24">
          <div className="grid gap-12 md:grid-cols-3">
            <div className="md:col-span-1">
              <p className="text-sm font-medium uppercase tracking-widest text-stone-500">
                Featured box
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                {featured.name}
              </h2>
              <p className="mt-4 text-stone-600">{featured.tagline}</p>
              <p className="mt-6 text-xl">{formatPrice(featured.priceCents)}</p>
            </div>
            <ul className="grid gap-6 sm:grid-cols-2 md:col-span-2">
              {featured.features.map((f) => (
                <li key={f} className="rounded-2xl bg-stone-50 p-6">
                  <p className="font-medium">{f}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {posts.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="flex items-baseline justify-between">
            <h2 className="text-3xl font-semibold tracking-tight">
              From the blog
            </h2>
            <Link href="/blog" className="text-sm font-medium underline">
              All posts
            </Link>
          </div>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group rounded-2xl border border-stone-200 p-6 hover:border-stone-400"
              >
                <time className="text-sm text-stone-500">
                  {formatDate(post.date)}
                </time>
                <h3 className="mt-2 text-lg font-semibold group-hover:underline">
                  {post.title}
                </h3>
                <p className="mt-2 text-sm text-stone-600">{post.excerpt}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section id="join" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-16">
        <div className="rounded-3xl bg-stone-100 px-8 py-16 text-center">
          <h2 className="text-3xl font-semibold tracking-tight">
            Never miss a drop
          </h2>
          <p className="mx-auto mt-4 max-w-md text-stone-600">
            Japanese sets sell out fast. Get notified about new booster boxes,
            restocks, and when singles go live.
          </p>
          <div className="mx-auto mt-8 max-w-md">
            <SubscribeForm source="home" />
          </div>
        </div>
      </section>
    </>
  );
}
