// Catalog lives in code for now; stock levels live in the database (see lib/inventory.ts).

export type Category = {
  slug: string;
  name: string;
  description: string;
};

export type SealedDetails = {
  setName: string;
  setCode: string;
  language: string;
  releaseDate: string;
  packsPerBox: number;
  cardsPerPack: number;
};

export type Condition =
  | "Near Mint"
  | "Lightly Played"
  | "Moderately Played"
  | "Heavily Played"
  | "Damaged";

export type SingleDetails = {
  setName: string;
  setCode: string;
  language: string;
  cardNumber: string;
  rarity: string;
  condition: Condition;
  grade?: {
    company: "PSA" | "BGS" | "CGC";
    grade: string;
    certNumber?: string;
  };
};

type BaseProduct = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string[];
  priceCents: number;
  categorySlug: string;
  images: { src: string; alt: string }[];
  features: string[];
  /** Max units in a single order. */
  maxPerOrder: number;
  /** Max units one customer (by email or shipping address) can buy across all orders. Use 1 for one-of-a-kind singles. */
  maxPerCustomer: number;
};

export type Product = BaseProduct &
  (
    | { kind: "sealed"; sealed: SealedDetails }
    | { kind: "single"; single: SingleDetails }
  );

export const categories: Category[] = [
  {
    slug: "booster-boxes",
    name: "Booster Boxes",
    description:
      "Factory-sealed Japanese Pokémon TCG booster boxes, imported directly from Japan.",
  },
  {
    slug: "singles",
    name: "Singles",
    description: "Hand-inspected singles, raw and graded. Coming soon.",
  },
];

// Example listing: verify set details and set your own price before launch.
export const products: Product[] = [
  {
    id: "storm-emeralda-booster-box",
    slug: "storm-emeralda-booster-box",
    kind: "sealed",
    name: "Storm Emeralda Booster Box",
    tagline: "Japanese expansion. Factory sealed in original shrink wrap.",
    description: [
      "A factory-sealed Japanese booster box of Storm Emeralda. Every box is sourced from trusted distributors in Japan and inspected on arrival.",
      "Boxes ship with the original Pokémon Company shrink wrap intact, double-boxed with padding so corners arrive crisp.",
    ],
    priceCents: 10000,
    categorySlug: "booster-boxes",
    images: [
      {
        src: "/products/storm-emeralda-booster-box.webp",
        alt: "Storm Emeralda Japanese booster box",
      },
    ],
    features: [
      "100% authentic, sourced from Japan",
      "Factory sealed, shrink wrap intact",
      "Double-boxed with protective padding",
      "Ships in 1–2 business days",
    ],
    maxPerOrder: 2,
    maxPerCustomer: 2,
    sealed: {
      setName: "Storm Emeralda",
      setCode: "TBD",
      language: "Japanese",
      releaseDate: "TBD",
      packsPerBox: 30,
      cardsPerPack: 5,
    },
  },
];

export function getProductSpecs(product: Product): [string, string][] {
  if (product.kind === "sealed") {
    const s = product.sealed;
    return [
      ["Set", `${s.setName} (${s.setCode})`],
      ["Language", s.language],
      ["Release date", s.releaseDate],
      ["Contents", `${s.packsPerBox} packs × ${s.cardsPerPack} cards`],
      ["Condition", "Factory sealed"],
    ];
  }
  const s = product.single;
  return [
    ["Set", `${s.setName} (${s.setCode})`],
    ["Card number", s.cardNumber],
    ["Rarity", s.rarity],
    ["Language", s.language],
    s.grade
      ? ["Grade", `${s.grade.company} ${s.grade.grade}`]
      : ["Condition", s.condition],
    ...(s.grade?.certNumber
      ? [["Cert #", s.grade.certNumber] as [string, string]]
      : []),
  ];
}

export function getProductBadges(product: Product): string[] {
  if (product.kind === "sealed") return [product.sealed.language, "Sealed"];
  const s = product.single;
  return [
    s.language,
    s.grade ? `${s.grade.company} ${s.grade.grade}` : s.condition,
  ];
}

export function getProductBySlug(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function getProductById(id: string) {
  return products.find((p) => p.id === id);
}

export function getCategory(slug: string) {
  return categories.find((c) => c.slug === slug);
}

export function getProductsInCategory(slug: string) {
  return products.filter((p) => p.categorySlug === slug);
}

export function formatPrice(cents: number, currency = "usd") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}
