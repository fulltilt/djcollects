import { getDb } from "@/lib/db";

export type Subscriber = {
  email: string;
  source: string;
  createdAt: string;
};

export function listSubscribers(): Subscriber[] {
  return getDb()
    .prepare(
      "SELECT email, source, created_at AS createdAt FROM subscribers ORDER BY id",
    )
    .all() as Subscriber[];
}

export function addSubscriber(email: string, source: string) {
  const result = getDb()
    .prepare("INSERT OR IGNORE INTO subscribers (email, source) VALUES (?, ?)")
    .run(email, source);
  return { created: result.changes > 0 };
}

export function normalizeEmail(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const email = input.trim().toLowerCase();
  if (email.length > 254 || /\s/.test(email)) return null;
  const parts = email.split("@");
  if (parts.length !== 2) return null;
  const [local, domain] = parts;
  const dot = domain.lastIndexOf(".");
  return local && dot > 0 && dot < domain.length - 1 ? email : null;
}
