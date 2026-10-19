import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { formatDate, getAllPosts, getPost } from "@/lib/blog";

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: { type: "article", publishedTime: post.date },
  };
}

export default function PostPage({ params }: PageProps<"/blog/[slug]">) {
  return (
    <Suspense
      fallback={<p className="mx-auto max-w-2xl px-6 py-16">Loading post...</p>}
    >
      <PostContent params={params} />
    </Suspense>
  );
}

async function PostContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <article className="mx-auto max-w-2xl px-6 py-16">
      <Link
        href="/blog"
        className="text-sm text-stone-500 hover:text-stone-900"
      >
        ← All posts
      </Link>
      <time className="mt-8 block text-sm text-stone-500">
        {formatDate(post.date)}
      </time>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight">
        {post.title}
      </h1>
      {/* Markdown is authored by site owners in /content, so it's trusted. */}
      <div
        className="prose-content mt-10"
        dangerouslySetInnerHTML={{ __html: post.html }}
      />
    </article>
  );
}
