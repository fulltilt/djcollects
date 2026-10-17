import type { Metadata } from "next";
import Link from "next/link";
import { formatDate, getAllPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description: "Stories, guides, and behind-the-scenes notes.",
};

export default function BlogPage() {
  const posts = getAllPosts();
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-4xl font-semibold tracking-tight">Blog</h1>
      <ul className="mt-10 divide-y divide-stone-200">
        {posts.map((post) => (
          <li key={post.slug} className="py-8">
            <Link href={`/blog/${post.slug}`} className="group block">
              <time className="text-sm text-stone-500">
                {formatDate(post.date)}
              </time>
              <h2 className="mt-1 text-2xl font-semibold group-hover:underline">
                {post.title}
              </h2>
              <p className="mt-2 text-stone-600">{post.excerpt}</p>
            </Link>
          </li>
        ))}
      </ul>
      {posts.length === 0 && (
        <p className="mt-10 text-stone-500">No posts yet.</p>
      )}
    </div>
  );
}
