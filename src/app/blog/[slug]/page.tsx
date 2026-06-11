import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReadingProgressBar } from "../../components/ReadingProgressBar";
import { getPost, posts } from "../posts";

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
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
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <>
      {/* Reading progress bar — only rendered on blog post pages */}
      <ReadingProgressBar />

      <main className="mx-auto min-h-screen w-full max-w-2xl px-6 py-16 sm:py-24">
        <Link
          href="/blog"
          className="text-sm text-foreground/60 transition hover:text-foreground"
        >
          ← Back to blog
        </Link>

        <article className="mt-8">
          <h1 className="bg-gradient-to-r from-[var(--brand-start)] to-[var(--brand-end)] bg-clip-text text-3xl font-semibold text-transparent sm:text-4xl">
            {post.title}
          </h1>
          <p className="mt-2 text-sm text-foreground/50">
            {new Date(post.date).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}{" "}
            · {post.readingTime}
          </p>

          <div className="mt-8 space-y-6">
            {post.body.map((block, i) =>
              block.type === "heading" ? (
                <h2 key={i} className="text-xl font-semibold">
                  {block.text}
                </h2>
              ) : (
                <p key={i} className="text-foreground/80 leading-relaxed">
                  {block.text}
                </p>
              )
            )}
          </div>
        </article>
      </main>
    </>
  );
}
