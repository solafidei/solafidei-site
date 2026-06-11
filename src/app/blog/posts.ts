export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readingTime: string;
  /** Article body as an ordered list of paragraphs / section headings. */
  body: Array<{ type: "heading" | "paragraph"; text: string }>;
};

export const posts: BlogPost[] = [
  {
    slug: "shipping-digital-products-with-confidence",
    title: "Shipping digital products with confidence",
    excerpt:
      "How small, focused teams launch and scale software without losing momentum — and the habits that keep quality high along the way.",
    date: "2026-06-08",
    readingTime: "6 min read",
    body: [
      {
        type: "paragraph",
        text: "Launching a product is rarely the hard part. Keeping it healthy, fast, and a joy to use as it grows — that is where most teams stumble. Over the years we have found that a handful of repeatable habits make the difference between a launch that fizzles and one that compounds.",
      },
      { type: "heading", text: "Start with the smallest honest version" },
      {
        type: "paragraph",
        text: "An MVP is not a half-built product; it is the smallest thing that tells you the truth about whether you are solving a real problem. Strip the idea back to the single workflow that delivers value, build that well, and put it in front of real users as quickly as you responsibly can.",
      },
      {
        type: "paragraph",
        text: "The temptation is always to add one more feature before launch. Resist it. Every feature you ship before you have validated the core is a bet placed before you have seen the cards.",
      },
      { type: "heading", text: "Make feedback cheap to collect" },
      {
        type: "paragraph",
        text: "The faster you can hear from users, the faster you can correct course. Instrument the product so you can see what people actually do, not just what they say. A short feedback loop turns guesswork into a series of small, confident decisions.",
      },
      {
        type: "paragraph",
        text: "We lean on lightweight analytics, in-product prompts, and the occasional five-minute call. None of it is glamorous, but together it keeps the team pointed at the things that matter.",
      },
      { type: "heading", text: "Invest in the boring foundations" },
      {
        type: "paragraph",
        text: "Continuous integration, automated tests, and a reliable deploy pipeline feel like overhead on day one and like oxygen by month three. They are what let a small team move quickly without breaking things — and what let you sleep the night before a big release.",
      },
      {
        type: "paragraph",
        text: "None of these ideas are new, and that is rather the point. Confidence comes not from heroics but from a set of unremarkable habits, applied consistently, long after the launch-day excitement has faded.",
      },
    ],
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}
