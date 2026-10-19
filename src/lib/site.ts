export const site = {
  name: "DJCollects",
  tagline: "Authentic Japanese Pokémon TCG, factory sealed.",
  description:
    "Sealed Japanese Pokémon booster boxes, imported from Japan and shipped with care.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001",
  contactEmail: "support@djcollects.com",
  currency: "usd",
};

export const nav = [
  { href: "/shop", label: "Shop" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
];
