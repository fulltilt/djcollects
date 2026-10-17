import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

// Posts are markdown files in /content/blog. Filename (minus .md) is the URL slug.
const POSTS_DIR = path.join(process.cwd(), "content", "blog");

export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
};

export function getAllPosts(): PostMeta[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((file) => {
      const slug = file.replace(/\.md$/, "");
      const { data } = matter(
        fs.readFileSync(path.join(POSTS_DIR, file), "utf8"),
      );
      return {
        slug,
        title: String(data.title ?? slug),
        date: String(data.date ?? ""),
        excerpt: String(data.excerpt ?? ""),
      };
    })
    .filter((p) => !p.slug.startsWith("_"))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getPost(slug: string) {
  // Only allow known slugs so the param can't be used for path traversal.
  const meta = getAllPosts().find((p) => p.slug === slug);
  if (!meta) return null;
  const { content } = matter(
    fs.readFileSync(path.join(POSTS_DIR, `${slug}.md`), "utf8"),
  );
  return { ...meta, html: marked.parse(content, { async: false }) };
}

export function formatDate(date: string) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}
