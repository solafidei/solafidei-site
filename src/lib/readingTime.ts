/**
 * Reading-time helpers for blog posts.
 *
 * Word count is derived from the post body text (see {@link countWords}) and
 * then converted into a human-friendly estimate (see {@link readingTime}).
 */

const WORDS_PER_MINUTE = 200;
const MIN_WORDS_FOR_ESTIMATE = 150;

/**
 * Returns a human-readable reading-time estimate for the given word count.
 *
 * - Fewer than 150 words -> `"< 1 min read"`
 * - Otherwise -> `"X min read"` where X is `Math.ceil(wordCount / 200)`
 */
export function readingTime(wordCount: number): string {
  if (wordCount < MIN_WORDS_FOR_ESTIMATE) {
    return "< 1 min read";
  }

  const minutes = Math.ceil(wordCount / WORDS_PER_MINUTE);
  return `${minutes} min read`;
}

/**
 * Counts the words in a block of body text. Whitespace-delimited tokens are
 * treated as words; leading/trailing whitespace and empty tokens are ignored.
 */
export function countWords(text: string): number {
  const matches = text.trim().match(/\S+/g);
  return matches ? matches.length : 0;
}
