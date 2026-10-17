import Link from "next/link";
import { site } from "@/lib/site";
import { SubscribeForm } from "@/components/SubscribeForm";

export function Footer() {
  return (
    <footer className="mt-24 bg-stone-900 text-stone-300">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 md:grid-cols-2">
        <div>
          <p className="text-lg font-semibold text-white">{site.name}</p>
          <p className="mt-2 max-w-sm text-sm">{site.tagline}</p>
          <div className="mt-6 max-w-md">
            <SubscribeForm source="footer" dark />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8 text-sm">
          <div className="flex flex-col gap-2">
            <p className="font-medium text-white">Shop</p>
            <Link href="/shop" className="hover:text-white">
              All products
            </Link>
            <Link href="/categories/booster-boxes" className="hover:text-white">
              Booster Boxes
            </Link>
            <Link href="/categories/singles" className="hover:text-white">
              Singles
            </Link>
            <Link href="/cart" className="hover:text-white">
              Cart
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <p className="font-medium text-white">Company</p>
            <Link href="/about" className="hover:text-white">
              About
            </Link>
            <Link href="/blog" className="hover:text-white">
              Blog
            </Link>
            <Link href="/privacy" className="hover:text-white">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-white">
              Terms &amp; returns
            </Link>
            <a
              href={`mailto:${site.contactEmail}`}
              className="hover:text-white"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-stone-800 px-6 py-6 text-center text-xs text-stone-500">
        <p>© {site.name}. All rights reserved.</p>
        <p className="mx-auto mt-2 max-w-3xl">
          Pokémon and all related names are trademarks of Nintendo, Creatures
          Inc., and GAME FREAK inc. {site.name} is an independent retailer and
          is not affiliated with or endorsed by The Pokémon Company.
        </p>
      </div>
    </footer>
  );
}
