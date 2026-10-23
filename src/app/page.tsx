import Image from "next/image";
import Link from "next/link";
import { formatPrice, products } from "@/lib/products";
import { formatDate, getAllPosts } from "@/lib/blog";
import { site } from "@/lib/site";
import { SubscribeForm } from "@/components/SubscribeForm";
import { WhyDJCollects } from "@/components/WhyDJCollects";

const upcoming = [
  {
    id: "m7",
    eyebrow: "Japanese · MEGA Expansion · M7",
    name: "Aura Seeker",
    description:
      "The next Japanese MEGA expansion pack. 5 cards per pack — sealed boxes sourced straight from Japan.",
    pack: {
      src: "/upcoming/m7-aura-seeker-pack.webp",
      alt: "Aura Seeker (M7) Japanese Pokémon TCG booster pack",
      width: 483,
      height: 939,
    },
    chase: null,
  },
  {
    id: "cbb7c",
    eyebrow: "Simplified Chinese · Gem Pack · CBB7C",
    name: "Gem Pack Vol. 7",
    description:
      "Psyduck takes the spotlight in the seventh Gem Pack. 4 cards per pack, with Misty's Psyduck as the chase.",
    pack: {
      src: "/upcoming/gem-pack-vol7-pack.webp",
      alt: "Pokémon Gem Pack Vol. 7 booster pack featuring Psyduck",
      width: 1442,
      height: 2560,
    },
    chase: {
      src: "/upcoming/gem-pack-vol7-misty-psyduck.webp",
      alt: "Misty's Psyduck chase card from Gem Pack Vol. 7",
      label: "Chase card · Misty's Psyduck",
      width: 868,
      height: 1212,
    },
  },
];

export default function Home() {
  const featured = products[0];
  const posts = getAllPosts().slice(0, 3);

  return (
    <>
      <section className="bg-linear-to-b from-stone-100 to-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-14 md:grid-cols-2 md:gap-12 md:py-24">
          <div className="order-1">
            <p className="text-sm font-medium uppercase tracking-widest text-stone-500">
              Japanese Pokémon TCG · Bay Area rooted
            </p>

            <h1 className="mt-5 max-w-xl text-4xl font-semibold leading-tight tracking-tight text-stone-900 md:text-5xl lg:text-6xl">
              Japanese Pokémon. Straight to your collection.
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-relaxed text-stone-600">
              Discover Japanese Pokémon TCG sealed products, sourced through our
              connections in Japan and packed with care.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center rounded-full bg-stone-900 px-7 py-4 font-semibold text-white shadow-lg transition hover:bg-stone-700"
              >
                Shop Booster Boxes
                <span aria-hidden="true" className="ml-2">
                  →
                </span>
              </Link>

              <Link
                href="/about"
                className="inline-flex items-center justify-center rounded-full border border-stone-300 px-7 py-4 font-medium text-stone-800 transition hover:bg-stone-100"
              >
                Our Story
              </Link>
            </div>
          </div>

          <div className="order-2">
            <div className="relative overflow-hidden rounded-3xl shadow-xl ring-1 ring-stone-900/5">
              <Image
                src="/hero-storm-emeralda.webp"
                alt="Storm Emeralda Japanese Pokémon TCG artwork featuring Rayquaza"
                width={2000}
                height={552}
                priority
                sizes="(min-width: 1152px) 552px, (min-width: 768px) 50vw, 100vw"
                className="aspect-4/3 w-full object-cover object-right md:aspect-3/4 lg:aspect-4/3"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pt-16 md:pt-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-stone-500">
              Coming soon
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-stone-900 md:text-4xl">
              Upcoming releases.
            </h2>
            <p className="mt-4 max-w-xl leading-relaxed text-stone-600">
              Two new sets are on the way. Join the list to hear first when they
              land.
            </p>
          </div>

          <Link
            href="#join"
            className="inline-flex items-center gap-2 text-sm font-semibold text-stone-900 transition hover:text-stone-500"
          >
            Get notified
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {upcoming.map((release) => (
            <article
              key={release.id}
              className="flex flex-col overflow-hidden rounded-3xl border border-stone-200 bg-white"
            >
              <div className="flex items-end justify-center gap-4 bg-linear-to-b from-stone-100 to-stone-50 px-6 pt-8 pb-6">
                <Image
                  src={release.pack.src}
                  alt={release.pack.alt}
                  width={release.pack.width}
                  height={release.pack.height}
                  sizes="(min-width: 768px) 200px, 40vw"
                  className="h-64 w-auto drop-shadow-xl md:h-72"
                />
                {release.chase && (
                  <figure className="flex flex-col items-center">
                    <Image
                      src={release.chase.src}
                      alt={release.chase.alt}
                      width={release.chase.width}
                      height={release.chase.height}
                      sizes="(min-width: 768px) 200px, 40vw"
                      className="h-56 w-auto rounded-xl shadow-xl ring-1 ring-stone-900/10 md:h-64"
                    />
                    <figcaption className="mt-2 text-xs font-medium text-stone-500">
                      {release.chase.label}
                    </figcaption>
                  </figure>
                )}
              </div>

              <div className="flex flex-1 flex-col p-6 md:p-8">
                <p className="text-xs font-medium uppercase tracking-wider text-stone-500">
                  {release.eyebrow}
                </p>
                <h3 className="mt-3 text-2xl font-semibold tracking-tight text-stone-900">
                  {release.name}
                </h3>
                <p className="mt-3 flex-1 leading-relaxed text-stone-600">
                  {release.description}
                </p>
                <Link
                  href="#join"
                  className="mt-6 inline-flex w-fit items-center justify-center rounded-full border border-stone-300 px-6 py-3 text-sm font-semibold text-stone-800 transition hover:bg-stone-100"
                >
                  Notify me
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {featured && (
        <section className="mx-auto max-w-6xl px-6 py-16 md:py-24">
          <div className="grid items-center gap-10 overflow-hidden rounded-3xl border border-stone-200 bg-white p-6 md:grid-cols-2 md:gap-14 md:p-10">
            {/* Product image */}
            <Link
              href={`/products/${featured.slug}`}
              className="group block overflow-hidden rounded-2xl bg-stone-50"
            >
              {featured.images[0] && (
                <Image
                  src={featured.images[0].src}
                  alt={featured.images[0].alt}
                  width={800}
                  height={800}
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="aspect-square w-full object-contain p-6 transition duration-300 group-hover:scale-105 md:p-10"
                />
              )}
            </Link>

            {/* Product details */}
            <div>
              <p className="text-sm font-medium uppercase tracking-widest text-stone-500">
                Featured product
              </p>

              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-stone-900 md:text-4xl">
                {featured.name}
              </h2>

              <p className="mt-4 text-lg leading-relaxed text-stone-600">
                {featured.tagline}
              </p>

              <p className="mt-6 text-2xl font-semibold text-stone-900">
                {formatPrice(featured.priceCents)}
              </p>

              {featured.features.length > 0 && (
                <ul className="mt-6 space-y-3">
                  {featured.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 text-stone-600"
                    >
                      <span aria-hidden="true" className="mt-1 text-stone-900">
                        ✓
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href={`/products/${featured.slug}`}
                  className="inline-flex items-center justify-center rounded-full bg-stone-900 px-7 py-4 font-semibold text-white transition hover:bg-stone-700"
                >
                  View Product
                  <span aria-hidden="true" className="ml-2">
                    →
                  </span>
                </Link>

                <Link
                  href="/shop"
                  className="inline-flex items-center justify-center rounded-full border border-stone-300 px-7 py-4 font-medium text-stone-800 transition hover:bg-stone-50"
                >
                  Browse All Products
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      <WhyDJCollects />

      {posts.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-widest text-stone-500">
                From the DJCollects Blog
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-stone-900 md:text-4xl">
                Notes from the collecting world.
              </h2>
              <p className="mt-4 max-w-xl leading-relaxed text-stone-600">
                Explore Japanese Pokémon sets, collecting tips, and the story
                behind DJCollects.
              </p>
            </div>

            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-semibold text-stone-900 transition hover:text-stone-500"
            >
              View all articles
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex h-full flex-col rounded-2xl border border-stone-200 bg-white p-6 transition duration-200 hover:-translate-y-1 hover:border-stone-300 hover:shadow-lg"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-medium uppercase tracking-wider text-stone-500">
                    DJCollects Journal
                  </span>
                  <time
                    dateTime={post.date}
                    className="shrink-0 text-xs text-stone-500"
                  >
                    {formatDate(post.date)}
                  </time>
                </div>

                <h3 className="mt-5 text-xl font-semibold leading-snug tracking-tight text-stone-900 transition group-hover:text-stone-600">
                  {post.title}
                </h3>

                <p className="mt-3 flex-1 text-sm leading-relaxed text-stone-600">
                  {post.excerpt}
                </p>

                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-stone-900">
                  Read article
                  <span
                    aria-hidden="true"
                    className="transition-transform group-hover:translate-x-1"
                  >
                    →
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section
        id="join"
        className="scroll-mt-24 border-t border-stone-200 bg-stone-900"
      >
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium uppercase tracking-widest text-stone-400">
              The Next Drop Starts Here
            </p>

            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-5xl">
              Never miss a drop.
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-stone-300 md:text-lg">
              Be the first to hear about new Japanese Pokémon booster boxes,
              restocks, and upcoming releases from DJCollects.
            </p>

            <div className="mx-auto mt-8 max-w-md">
              <SubscribeForm source="home" />
            </div>

            <p className="mt-5 text-xs leading-relaxed text-stone-400">
              Sign up for occasional product updates and restock notifications.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
