import type { Metadata } from "next";
import Link from "next/link";
import { BackToTop } from "../components/BackToTop";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Articles, notes, and updates from the Solafidei team on building products, automation, and the web.",
  robots: { index: true, follow: true },
  alternates: { canonical: "https://solafidei.com/blog" },
};

type Post = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
};

const POSTS: Post[] = [
  {
    slug: "shipping-fast-without-breaking-things",
    title: "Shipping fast without breaking things",
    excerpt:
      "How we balance velocity and reliability when delivering client work on tight timelines.",
    date: "5 June 2026",
  },
  {
    slug: "automation-that-actually-saves-time",
    title: "Automation that actually saves time",
    excerpt:
      "A practical look at where automation pays off — and where it quietly costs you more than it saves.",
    date: "28 May 2026",
  },
  {
    slug: "designing-for-the-first-five-seconds",
    title: "Designing for the first five seconds",
    excerpt:
      "First impressions decide whether visitors stay. Here's how we earn that attention.",
    date: "19 May 2026",
  },
  {
    slug: "why-we-prefer-boring-technology",
    title: "Why we prefer boring technology",
    excerpt:
      "Choosing proven tools over the shiny and new is usually the faster path to a great product.",
    date: "11 May 2026",
  },
  {
    slug: "the-cost-of-a-slow-website",
    title: "The real cost of a slow website",
    excerpt:
      "Performance isn't a vanity metric — it's revenue. We break down the numbers.",
    date: "2 May 2026",
  },
  {
    slug: "writing-emails-people-reply-to",
    title: "Writing emails people actually reply to",
    excerpt:
      "Lessons from running outreach campaigns that get responses instead of being ignored.",
    date: "24 April 2026",
  },
  {
    slug: "accessibility-is-a-feature",
    title: "Accessibility is a feature, not a checkbox",
    excerpt:
      "Building for everyone makes products better for everyone. Where to start.",
    date: "16 April 2026",
  },
  {
    slug: "from-idea-to-launch-in-two-weeks",
    title: "From idea to launch in two weeks",
    excerpt:
      "A behind-the-scenes look at how we scope, build, and ship an MVP quickly.",
    date: "7 April 2026",
  },
];

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
        Notes on building products, automation, and the web.
      </p>

      <ul className="mt-10 space-y-8">
        {POSTS.map((post) => (
          <li key={post.slug}>
            <article>
              <p className="text-xs uppercase tracking-wide text-foreground/40">
                {post.date}
              </p>
              <h2 className="mt-1 text-xl font-semibold">
                <Link
                  href={`/blog/${post.slug}`}
                  className="transition hover:text-[var(--brand-start)]"
                >
                  {post.title}
                </Link>
              </h2>
              <p className="mt-2 text-foreground/80 leading-relaxed">
                {post.excerpt}
              </p>
            </article>
          </li>
        ))}
      </ul>

      <BackToTop />
    </main>
  );
}
