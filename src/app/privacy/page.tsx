import type { Metadata } from "next";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Privacy policy" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-4xl font-semibold tracking-tight">Privacy policy</h1>
      {/* <p className="mt-4 text-sm text-stone-500">
        Placeholder. Have this reviewed before launch.
      </p> */}
      <div className="prose-content mt-10">
        <h2>What we collect</h2>
        <p>
          If you join our interest list we store your email address and when you
          signed up. When you place an order, payment is processed by Stripe; we
          never see or store your full card details. We receive your name,
          email, and shipping address to fulfill your order.
        </p>
        <h2>How we use it</h2>
        <ul>
          <li>
            To send product updates you asked for (you can unsubscribe at any
            time).
          </li>
          <li>To process, ship, and support your orders.</li>
        </ul>
        <h2>Your rights</h2>
        <p>
          You can ask us to access, correct, or delete your data at any time by
          emailing{" "}
          <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>.
        </p>
      </div>
    </div>
  );
}
