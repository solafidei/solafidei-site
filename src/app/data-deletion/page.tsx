import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Data Deletion Instructions",
  description:
    "How to request deletion of your personal data from the Solafidei booking system and WhatsApp service.",
  robots: { index: true, follow: true },
  alternates: { canonical: "https://solafidei.com/data-deletion" },
};

const SUPPORT_EMAIL = "info@solafidei.com";

export default function DataDeletionPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl px-6 py-16 sm:py-24">
      <Link
        href="/"
        className="text-sm text-foreground/60 transition hover:text-foreground"
      >
        ← Back to home
      </Link>

      <h1 className="mt-8 bg-gradient-to-r from-[var(--brand-start)] to-[var(--brand-end)] bg-clip-text text-3xl font-semibold text-transparent sm:text-4xl">
        Data Deletion Instructions
      </h1>

      <p className="mt-6 text-foreground/80 leading-relaxed">
        Solafidei operates a booking system that integrates with WhatsApp to
        send and receive messages related to your bookings. This page explains
        how you can request the deletion of any personal data we hold about you.
      </p>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">What data we may hold</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-foreground/80 leading-relaxed">
          <li>Your name and WhatsApp phone number.</li>
          <li>Booking details (dates, services, and related notes).</li>
          <li>Messages exchanged with us through WhatsApp.</li>
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">How to request deletion</h2>
        <p className="mt-4 text-foreground/80 leading-relaxed">
          To request that we delete your personal data, send an email to{" "}
          <a
            className="text-[var(--brand-start)] underline underline-offset-4"
            href={`mailto:${SUPPORT_EMAIL}?subject=Data%20Deletion%20Request`}
          >
            {SUPPORT_EMAIL}
          </a>{" "}
          with the subject line <strong>&ldquo;Data Deletion Request&rdquo;</strong>.
          Please include the following so we can locate your records:
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-foreground/80 leading-relaxed">
          <li>The full name used for your booking.</li>
          <li>The WhatsApp phone number associated with your account.</li>
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">What happens next</h2>
        <p className="mt-4 text-foreground/80 leading-relaxed">
          We will verify your request and permanently delete your personal data
          from our systems within <strong>30 days</strong>. We will email you to
          confirm once the deletion is complete. Some information may be retained
          where required by law (for example, financial records), and we will
          tell you if this applies.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Questions</h2>
        <p className="mt-4 text-foreground/80 leading-relaxed">
          If you have any questions about this process, contact us at{" "}
          <a
            className="text-[var(--brand-start)] underline underline-offset-4"
            href={`mailto:${SUPPORT_EMAIL}`}
          >
            {SUPPORT_EMAIL}
          </a>
          .
        </p>
      </section>
    </main>
  );
}
