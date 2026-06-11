import type { Metadata } from "next";
import Link from "next/link";

import { countWords, readingTime } from "@/lib/readingTime";
import { posts } from "./posts";

export const metadata: Metadata = {
  title: "Blog",
  description: "Notes on engineering, design, and the products we build.",
  robots: { index: true, follow: true },
  alternates: { canonical: "https://solafidei.com/blog" },
};

export default function BlogIndexPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl px-6 py-16 sm:py-24">
      <Link
        href="/"
        className="text-sm text-foreground/60 transition hover:text-foreground"
      >
        ← Back to home
      </Link>

      <h1 className="mt-8 bg-gradient-to-r from-[var(--brand-start)] to-[var(--brand-end)] bg-clip-text text-3xl font-semibold text-transparent sm:text-4xl">
        Blog
      </h1>
      <p className="mt-2 text-sm text-foreground/50">
        Notes on engineering, design, and the products we build.
      </p>

      <ul className="mt-10 space-y-8">
        {posts.map((post) => (
          <li
            key={post.slug}
            className="rounded-xl border border-foreground/10 p-6 transition hover:border-foreground/20"
          >
            <Link href={`/blog/${post.slug}`} className="group block">
              <h2 className="text-xl font-semibold transition group-hover:text-[var(--brand-start)]">
                {post.title}
              </h2>
              <p className="mt-1 text-sm text-foreground/50">
                {readingTime(countWords(post.body))}
              </p>
              <p className="mt-3 text-foreground/80 leading-relaxed">
                {post.excerpt}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
