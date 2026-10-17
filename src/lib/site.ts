export const site = {
  name: "DJCollects",
  tagline: "Authentic Japanese Pokémon TCG, factory sealed.",
  description:
    "Sealed Japanese Pokémon booster boxes, imported from Japan and shipped with care. Singles coming soon.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  contactEmail: "dave.doria@gmail.com",
  currency: "usd",
};

export const nav = [
  { href: "/shop", label: "Shop" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
];
