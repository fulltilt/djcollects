// Local-only dashboard for the live interest list: npm run subscribers
import { createServer } from "node:http";

const REMOTE_URL = (process.env.REMOTE_URL ?? "https://djcollects.com").replace(
  /\/$/,
  "",
);
const TOKEN = process.env.REMOTE_ADMIN_TOKEN;
const PORT = Number(process.env.DASHBOARD_PORT ?? 4000);

if (!TOKEN) {
  console.error(
    "Set REMOTE_ADMIN_TOKEN in .env.dashboard (the live server's ADMIN_TOKEN).",
  );
  process.exit(1);
}

async function fetchCsv() {
  const res = await fetch(`${REMOTE_URL}/api/subscribers`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok)
    throw new Error(`${res.status} ${res.statusText} from ${REMOTE_URL}`);
  return res.text();
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += c;
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  // Drop the "'" the API prefixes to formula-like values for spreadsheet safety.
  return rows.slice(1).map(([email, source, createdAt]) => ({
    email: email.replace(/^'/, ""),
    source,
    createdAt,
  }));
}

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

function page(subscribers, error) {
  const newestFirst = [...subscribers].reverse();
  const counts = {};
  for (const s of subscribers) counts[s.source] = (counts[s.source] ?? 0) + 1;
  const bySource = Object.entries(counts)
    .map(([k, v]) => `<span class="chip">${escapeHtml(k)}: ${v}</span>`)
    .join("");
  const rows = newestFirst
    .map(
      (s) =>
        `<tr><td>${escapeHtml(s.email)}</td><td>${escapeHtml(s.source)}</td><td>${escapeHtml(
          new Date(`${s.createdAt.replace(" ", "T")}Z`).toLocaleString(),
        )}</td></tr>`,
    )
    .join("");

  return `<!doctype html><html><head><meta charset="utf-8"><title>Interest list</title>
<style>
  body{font-family:system-ui,sans-serif;margin:2rem auto;max-width:900px;color:#1c1917;padding:0 1rem}
  h1{margin:0}.muted{color:#78716c}.bar{display:flex;gap:.75rem;align-items:center;flex-wrap:wrap;margin:1rem 0}
  .chip{background:#f5f5f4;border-radius:999px;padding:.2rem .7rem;font-size:.85rem}
  input{flex:1;min-width:200px;padding:.5rem .75rem;border:1px solid #d6d3d1;border-radius:8px}
  a.btn{background:#1c1917;color:#fff;padding:.5rem .9rem;border-radius:8px;text-decoration:none}
  table{width:100%;border-collapse:collapse}th,td{text-align:left;padding:.5rem;border-bottom:1px solid #e7e5e4}
  th{font-size:.8rem;text-transform:uppercase;letter-spacing:.05em;color:#78716c}
  .error{background:#fef2f2;color:#991b1b;padding:1rem;border-radius:8px}
</style></head><body>
<h1>Interest list</h1>
<p class="muted">${escapeHtml(REMOTE_URL)} · loaded ${new Date().toLocaleString()}</p>
${error ? `<p class="error">${escapeHtml(error)}</p>` : ""}
<div class="bar"><strong>${subscribers.length} total</strong>${bySource}</div>
<div class="bar">
  <input id="q" placeholder="Search emails…" autofocus>
  <a class="btn" href="/">Refresh</a>
  <a class="btn" href="/subscribers.csv">Download CSV</a>
</div>
<table><thead><tr><th>Email</th><th>Source</th><th>Signed up</th></tr></thead><tbody id="rows">${rows}</tbody></table>
<script>
  document.getElementById("q").addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase();
    for (const tr of document.querySelectorAll("#rows tr"))
      tr.hidden = !tr.cells[0].textContent.includes(q);
  });
</script>
</body></html>`;
}

createServer(async (req, res) => {
  try {
    if (req.url === "/subscribers.csv") {
      const csv = await fetchCsv();
      res.writeHead(200, {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="subscribers.csv"',
      });
      return res.end(csv);
    }
    if (req.url !== "/") return res.writeHead(404).end();
    let subscribers = [];
    let error = null;
    try {
      subscribers = parseCsv(await fetchCsv());
    } catch (err) {
      error = `Couldn't load subscribers: ${err.message}`;
    }
    res.writeHead(200, {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    });
    res.end(page(subscribers, error));
  } catch (err) {
    res.writeHead(500).end(String(err));
  }
}).listen(PORT, "127.0.0.1", () => {
  console.log(`Interest list dashboard: http://localhost:${PORT}`);
});
