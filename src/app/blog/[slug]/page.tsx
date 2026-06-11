import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { countWords, readingTime } from "@/lib/readingTime";
import { getPost, posts } from "../posts";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post) {
    return { title: "Post not found" };
  }

  return {
    title: post.title,
    description: post.excerpt,
    robots: { index: true, follow: true },
    alternates: { canonical: `https://solafidei.com/blog/${post.slug}` },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post) {
    notFound();
  }

  const paragraphs = post.body.split(/\n\s*\n/).filter((block) => block.trim());

  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl px-6 py-16 sm:py-24">
      <Link
        href="/blog"
        className="text-sm text-foreground/60 transition hover:text-foreground"
      >
        ← Back to blog
      </Link>

      <h1 className="mt-8 bg-gradient-to-r from-[var(--brand-start)] to-[var(--brand-end)] bg-clip-text text-3xl font-semibold text-transparent sm:text-4xl">
        {post.title}
      </h1>
      <p className="mt-2 text-sm text-foreground/50">
        {readingTime(countWords(post.body))}
      </p>

      <article className="mt-8 space-y-6">
        {paragraphs.map((paragraph, index) => (
          <p key={index} className="text-foreground/80 leading-relaxed">
            {paragraph}
          </p>
        ))}
      </article>
    </main>
  );
}
