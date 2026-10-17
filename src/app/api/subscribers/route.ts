import { timingSafeEqual } from "node:crypto";
import { listSubscribers } from "@/lib/subscribers";

function isAuthorized(request: Request) {
  const token = process.env.ADMIN_TOKEN;
  const header = request.headers.get("authorization") ?? "";
  if (!token || !header.startsWith("Bearer ")) return false;
  const a = Buffer.from(header.slice(7));
  const b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
}

// Prevent spreadsheet formula injection when the CSV is opened in Excel/Sheets.
function csvCell(value: string) {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safe.replaceAll('"', '""')}"`;
}

// Export the interest list: curl -H "Authorization: Bearer $ADMIN_TOKEN" http://localhost:3000/api/subscribers
export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return new Response("Unauthorized", { status: 401 });
  }
  const subscribers = await listSubscribers();
  const rows = [
    "email,source,created_at",
    ...subscribers.map((s) =>
      [s.email, s.source, s.createdAt].map(csvCell).join(","),
    ),
  ];
  return new Response(rows.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="subscribers.csv"',
      "Cache-Control": "no-store",
    },
  });
}
