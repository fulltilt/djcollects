// Client-only: import from client components.
import { useSyncExternalStore } from "react";
import { getProductById } from "@/lib/products";

export type CartItem = { productId: string; quantity: number };

const STORAGE_KEY = "cart:v1";
const EMPTY: CartItem[] = [];
const listeners = new Set<() => void>();
let cache: CartItem[] | null = null;

function isValidItem(item: unknown): item is CartItem {
  if (typeof item !== "object" || item === null) return false;
  const { productId, quantity } = item as CartItem;
  return (
    typeof productId === "string" &&
    !!getProductById(productId) &&
    Number.isInteger(quantity) &&
    quantity > 0
  );
}

function read(): CartItem[] {
  if (cache) return cache;
  try {
    const parsed: unknown = JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? "[]",
    );
    cache = Array.isArray(parsed) ? parsed.filter(isValidItem) : [];
  } catch {
    cache = [];
  }
  return cache;
}

function write(items: CartItem[]) {
  cache = items;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  for (const l of listeners) l();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Keep multiple tabs in sync.
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      cache = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function clampQuantity(productId: string, quantity: number) {
  const max = getProductById(productId)?.maxPerOrder ?? 1;
  return Math.max(0, Math.min(max, Math.floor(quantity)));
}

export const cart = {
  add(productId: string, quantity = 1) {
    const items = read();
    const existing = items.find((i) => i.productId === productId);
    const next = clampQuantity(productId, (existing?.quantity ?? 0) + quantity);
    cart.setQuantity(productId, next);
  },
  setQuantity(productId: string, quantity: number) {
    const q = clampQuantity(productId, quantity);
    const items = read();
    if (q === 0) return write(items.filter((i) => i.productId !== productId));
    const exists = items.some((i) => i.productId === productId);
    write(
      exists
        ? items.map((i) =>
            i.productId === productId ? { ...i, quantity: q } : i,
          )
        : [...items, { productId, quantity: q }],
    );
  },
  remove(productId: string) {
    write(read().filter((i) => i.productId !== productId));
  },
  clear() {
    write([]);
  },
};

export function useCart() {
  const items = useSyncExternalStore(subscribe, read, () => EMPTY);
  const count = items.reduce((n, i) => n + i.quantity, 0);
  const subtotalCents = items.reduce(
    (sum, i) =>
      sum + (getProductById(i.productId)?.priceCents ?? 0) * i.quantity,
    0,
  );
  return { items, count, subtotalCents };
}
