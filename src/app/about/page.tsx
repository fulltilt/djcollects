import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: `The story behind ${site.name}.`,
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
          Replace this with your story. How did you get into the Pokémon TCG,
          and why Japanese product?
        </p>
        <p>
          Explain how you source: who you buy from in Japan, how you verify
          authenticity, and how you inspect every box before it ships.
        </p>
        <p>
          We&apos;re starting with sealed booster boxes and adding
          hand-inspected singles soon. Join the list to hear when new sets and
          restocks land.
        </p>
      </div>
      <div className="mt-12 grid gap-6 sm:grid-cols-3">
        {[
          [
            "Authentic, always",
            "Sourced from trusted distributors in Japan. No reseals, ever.",
          ],
          [
            "Packed like it's ours",
            "Double-boxed with padding so corners and shrink arrive intact.",
          ],
          ["Real support", `Questions? Email ${site.contactEmail}.`],
        ].map(([title, body]) => (
          <div key={title} className="rounded-2xl bg-stone-50 p-6">
            <p className="font-medium">{title}</p>
            <p className="mt-2 text-sm text-stone-600">{body}</p>
          </div>
        ))}
      </div>
      <Link
        href="/shop"
        className="mt-12 inline-block rounded-full bg-stone-900 px-8 py-3 font-medium text-white"
      >
        Shop now
      </Link>
    </div>
  );
}
