'use client';

// Highlights the query term in text by wrapping it in <mark> tags.
// BUG: uses dangerouslySetInnerHTML with unsanitized user input — XSS.
function highlight(text: string, query: string): string {
  return text.replace(query, `<mark>${query}</mark>`);
}

interface Props {
  posts: { title: string; slug: string }[];
  query: string;
}

export default function SearchResults({ posts, query }: Props) {
  const filtered = posts.filter((p) =>
    p.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <ul>
      <li>Results for: <span dangerouslySetInnerHTML={{ __html: query }} /></li>
      {filtered.map((p) => (
        <li key={p.slug}>
          <a
            href={`/blog/${p.slug}`}
            dangerouslySetInnerHTML={{ __html: highlight(p.title, query) }}
          />
        </li>
      ))}
    </ul>
  );
}
