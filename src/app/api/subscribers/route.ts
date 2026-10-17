import { isAdminRequest } from "@/lib/admin";
import { listSubscribers } from "@/lib/subscribers";

// Prevent spreadsheet formula injection when the CSV is opened in Excel/Sheets.
function csvCell(value: string) {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safe.replaceAll('"', '""')}"`;
}

// Export the interest list: curl -H "Authorization: Bearer $ADMIN_TOKEN" http://localhost:3000/api/subscribers
export async function GET(request: Request) {
  if (!isAdminRequest(request)) {
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
