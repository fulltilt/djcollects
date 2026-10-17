import type { Metadata } from "next";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Terms, shipping & returns" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-4xl font-semibold tracking-tight">
        Terms, shipping &amp; returns
      </h1>
      <p className="mt-4 text-sm text-stone-500">
        Placeholder. Have this reviewed before launch.
      </p>
      <div className="prose-content mt-10">
        <h2>Authenticity</h2>
        <p>
          Every product we sell is authentic Pokémon Trading Card Game product
          sourced from Japan. Sealed products ship in their original factory
          shrink wrap.
        </p>
        <h2>Shipping</h2>
        <p>
          Orders ship within 1–2 business days to addresses in the United
          States. Sealed boxes are double-boxed with protective padding.
        </p>
        <h2>Returns</h2>
        <p>
          Sealed products may be returned within 14 days of delivery only if
          unopened with the factory shrink wrap fully intact. Opened product
          cannot be returned. Singles are sold as described; if an item arrives
          not as described, email{" "}
          <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a> within
          7 days with photos.
        </p>
        <h2>Purchase limits</h2>
        <p>
          We may limit quantities per customer and cancel orders that exceed
          posted limits.
        </p>
        <h2>Contents</h2>
        <p>
          Booster pack contents are random. We make no guarantees about specific
          cards or pull rates.
        </p>
        <h2>Payments</h2>
        <p>
          All payments are securely processed by Stripe. Prices are listed in
          USD.
        </p>
      </div>
    </div>
  );
}
