// Normalized identity keys used to enforce per-customer limits across orders.

const GMAIL_DOMAINS = new Set(["gmail.com", "googlemail.com"]);

/** Collapses common aliases: case, "+tags", and Gmail's ignored dots. */
export function emailKey(email: string): string {
  const [rawLocal = "", rawDomain = ""] = email.trim().toLowerCase().split("@");
  let local = rawLocal.split("+")[0];
  let domain = rawDomain;
  if (GMAIL_DOMAINS.has(domain)) {
    local = local.replaceAll(".", "");
    domain = "gmail.com";
  }
  return `${local}@${domain}`;
}

const STREET_WORDS: Record<string, string> = {
  street: "st",
  avenue: "ave",
  road: "rd",
  drive: "dr",
  boulevard: "blvd",
  lane: "ln",
  court: "ct",
  place: "pl",
  circle: "cir",
  parkway: "pkwy",
  highway: "hwy",
  terrace: "ter",
  north: "n",
  south: "s",
  east: "e",
  west: "w",
  northeast: "ne",
  northwest: "nw",
  southeast: "se",
  southwest: "sw",
};

// Dropped so "Apt 4", "Unit 4", and "#4" all match.
const UNIT_WORDS = new Set(["apt", "apartment", "ste", "suite", "unit"]);

type Address = {
  line1?: string | null;
  line2?: string | null;
  postal_code?: string | null;
  country?: string | null;
};

export function addressKey(address: Address | null | undefined): string | null {
  if (!address?.line1) return null;
  const street = [address.line1, address.line2]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w && !UNIT_WORDS.has(w))
    .map((w) => STREET_WORDS[w] ?? w)
    .join(" ");
  const country = (address.country ?? "").toUpperCase();
  let postal = (address.postal_code ?? "").replace(/\s/g, "").toLowerCase();
  if (country === "US") postal = postal.slice(0, 5);
  return `${street}|${postal}|${country}`;
}
