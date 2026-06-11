export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  /** Plain-text body. Blank lines separate paragraphs. */
  body: string;
};

export const posts: BlogPost[] = [
  {
    slug: "why-we-build-with-next",
    title: "Why we build with Next.js",
    excerpt:
      "A short tour of the trade-offs behind our framework choice and what it means for the products we ship.",
    date: "2026-05-20",
    body: `When we started Solafidei we wanted a stack that let a small team move quickly without sacrificing the things that matter for production software: performance, accessibility, and maintainability. Next.js gave us a single framework that covers the full surface area, from static marketing pages to interactive, data-driven applications.

The App Router lets us co-locate data fetching with the components that need it. Server Components keep our client bundles small, which matters a great deal for users on slower connections and older devices. We reach for client components only where interactivity genuinely requires them, and the result is pages that feel instant.

Streaming and partial rendering mean a user sees meaningful content as soon as it is ready, rather than waiting for the slowest part of the page. Combined with image optimisation and font handling out of the box, we spend less time wiring up infrastructure and more time on the parts of the product that are unique to our clients.

None of this is free of trade-offs. The framework moves quickly, and keeping up with releases takes deliberate effort. But the productivity gains, and the quality bar it nudges us toward, have been well worth it for the kind of work we do.`,
  },
  {
    slug: "design-systems-that-scale",
    title: "Design systems that scale",
    excerpt:
      "How a small set of well-chosen primitives keeps a growing product consistent.",
    date: "2026-04-08",
    body: `A design system is less about pixels and more about decisions. The goal is to make the right choice the easy choice, so that every screen feels like it belongs to the same product even when different people build it.

We start with tokens — colour, spacing, typography, and motion — and treat them as the single source of truth. Components are assembled from those tokens rather than hard-coded values, which means a change to the system propagates everywhere at once.

The hard part is restraint. It is tempting to add a new variant for every request, but each one increases the surface area that has to be learned, documented, and maintained. We favour a small number of flexible primitives over a large catalogue of one-off components.`,
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return posts.find((post) => post.slug === slug);
}
