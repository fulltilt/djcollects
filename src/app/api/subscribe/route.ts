import { after } from "next/server";
import { notifyNewSubscriber } from "@/lib/mailer";
import { addSubscriber, normalizeEmail } from "@/lib/subscribers";

const SOURCES = new Set(["popup", "footer", "home"]);

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  if (!body)
    return Response.json({ error: "Invalid request." }, { status: 400 });

  // Honeypot filled in: pretend success so bots don't retry.
  if (typeof body.company === "string" && body.company.length > 0) {
    return Response.json({ ok: true });
  }

  const email = normalizeEmail(body.email);
  if (!email)
    return Response.json(
      { error: "Please enter a valid email address." },
      { status: 400 },
    );

  const source =
    typeof body.source === "string" && SOURCES.has(body.source)
      ? body.source
      : "unknown";

  try {
    const { created } = addSubscriber(email, source);
    if (created) {
      after(() =>
        notifyNewSubscriber(email, source).catch((err) =>
          console.error("Failed to send signup notification", err),
        ),
      );
    }
  } catch (err) {
    console.error("Failed to save subscriber", err);
    return Response.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }

  // Same response for new and existing emails to avoid leaking who is subscribed.
  return Response.json({ ok: true });
}
