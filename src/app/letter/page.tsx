import type { Metadata } from "next";
import { Suspense } from "react";
import { AwarenessLetter } from "./AwarenessLetter";

export const metadata: Metadata = {
  title: "You clicked a simulated link",
  description: "Open your digital letter",
  openGraph: {
    title: "A message for you 💌",
    description: "Open your digital letter",
    images: ["/awareness-preview.png"],
    type: "website",
  },
  robots: { index: false, follow: false },
};

export default function LetterAwarenessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full bg-[radial-gradient(120%_90%_at_50%_0%,#fff5f9,#fbd9e8)]" aria-busy="true" aria-label="Loading" />
      }
    >
      <AwarenessLetter />
    </Suspense>
  );
}
