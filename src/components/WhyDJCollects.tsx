import Link from "next/link";

const reasons = [
  {
    title: "Japanese Sourcing",
    description:
      "Discover Japanese Pokémon TCG products sourced through our connections in Japan.",
  },
  {
    title: "Packed with Care",
    description:
      "Every order is handled with care, with attention to protecting your collectibles during shipping.",
  },
  {
    title: "Built for Collectors",
    description:
      "A shop shaped by a passion for Pokémon cards and the collector community.",
  },
  {
    title: "Looking for Something Else?",
    description:
      "Have a specific Japanese product in mind? Reach out and let us know what you're looking for.",
  },
];

export function WhyDJCollects() {
  return (
    <section className="border-y border-stone-200 bg-stone-50">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-stone-500">
            The DJCollects Difference
          </p>

          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-stone-900 md:text-4xl">
            Japanese Pokémon, collected with care.
          </h2>

          <p className="mt-5 text-lg leading-relaxed text-stone-600">
            Bringing Japanese Pokémon TCG products to collectors who appreciate
            something different.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map((reason) => (
            <div
              key={reason.title}
              className="rounded-2xl border border-stone-200 bg-white p-6 transition duration-200 hover:-translate-y-1 hover:shadow-md"
            >
              <h3 className="mt-5 text-lg font-semibold text-stone-900">
                {reason.title}
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-stone-600">
                {reason.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/about"
            className="inline-flex items-center justify-center rounded-full bg-stone-900 px-7 py-4 font-semibold text-white transition hover:bg-stone-700"
          >
            Get to Know DJCollects
            <span aria-hidden="true" className="ml-2">
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
