import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: `Learn the story behind ${site.name}, bringing Japanese Pokémon TCG sealed products to collectors.`,
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-sm font-medium uppercase tracking-widest text-stone-500">
        About us
      </p>

      <h1 className="mt-4 text-5xl font-semibold tracking-tight">
        Collectors first.
      </h1>

      <div className="mt-10 space-y-6 text-lg leading-relaxed text-stone-700">
        <p>
          What started with selling Pokémon cards at Bay Area vendor events has
          grown into a shop focused on bringing Japanese Pokémon TCG products to
          collectors. After more than a year on the local vendor circuit, I kept
          getting questions about Japanese sealed products and singles. Those
          conversations inspired me to take the next step and start sourcing
          Japanese products for the community.
        </p>

        <p>
          I'm fortunate to have reliable supplier relationships in Japan,
          helping me source products for collectors here at home. My goal is to
          make finding Japanese Pokémon TCG products a little easier, whether
          you're adding to your collection or looking for a specific box to
          open.
        </p>

        <p>
          We're starting with Japanese sealed booster boxes and plan to expand
          our selection as the shop grows. Have something specific in mind?
          Reach out with special requests, and I'll do my best to help source
          it.
        </p>

        <p>
          Thanks for supporting the shop and being part of the journey. Whether
          you're a longtime collector or just getting started, I'm glad you're
          here.
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-3">
        {[
          {
            title: "Sourced with care",
            body: "We work with reliable suppliers in Japan to bring Japanese Pokémon TCG products to collectors.",
          },
          {
            title: "Built for collectors",
            body: "A growing selection of Japanese sealed products, with room for special requests along the way.",
          },
          {
            title: "Real support",
            body: `Have a question or looking for something specific? Get in touch at ${site.contactEmail}.`,
          },
        ].map(({ title, body }) => (
          <div key={title} className="rounded-2xl bg-stone-50 p-6">
            <p className="font-medium">{title}</p>
            <p className="mt-2 text-sm leading-relaxed text-stone-600">
              {body}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-12 flex flex-wrap gap-4">
        <Link
          href="/shop"
          className="inline-block rounded-full bg-stone-900 px-8 py-3 font-medium text-white transition hover:bg-stone-700"
        >
          Shop now
        </Link>

        <Link
          href="/#join"
          className="inline-block rounded-full border border-stone-300 px-8 py-3 font-medium text-stone-900 transition hover:bg-stone-50"
        >
          Get restock alerts
        </Link>
      </div>
    </div>
  );
}
