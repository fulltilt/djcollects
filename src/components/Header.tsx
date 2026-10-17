import Link from "next/link";
import { nav, site } from "@/lib/site";
import { CartLink } from "@/components/CartLink";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
        <Link
          href="/"
          className="shrink-0 text-lg font-semibold tracking-tight"
        >
          {site.name}
        </Link>
        <nav className="flex items-center gap-4 overflow-x-auto whitespace-nowrap text-sm text-stone-600 sm:gap-6">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hover:text-stone-900"
            >
              {item.label}
            </Link>
          ))}
          <CartLink />
        </nav>
      </div>
    </header>
  );
}
