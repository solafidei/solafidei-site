import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms that govern your use of the Solafidei booking system and WhatsApp messaging service.",
  robots: { index: true, follow: true },
  alternates: { canonical: "https://solafidei.com/terms" },
};

const SUPPORT_EMAIL = "info@solafidei.com";
const EFFECTIVE_DATE = "8 June 2026";

export default function TermsOfServicePage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl px-6 py-16 sm:py-24">
      <Link
        href="/"
        className="text-sm text-foreground/60 transition hover:text-foreground"
      >
        ← Back to home
      </Link>

      <h1 className="mt-8 bg-gradient-to-r from-[var(--brand-start)] to-[var(--brand-end)] bg-clip-text text-3xl font-semibold text-transparent sm:text-4xl">
        Terms of Service
      </h1>
      <p className="mt-2 text-sm text-foreground/50">
        Effective date: {EFFECTIVE_DATE}
      </p>

      <p className="mt-6 text-foreground/80 leading-relaxed">
        These Terms of Service (&ldquo;Terms&rdquo;) govern your use of the
        Solafidei booking system and our messaging service operated through
        WhatsApp (together, the &ldquo;Service&rdquo;). By using the Service, you
        agree to these Terms.
      </p>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Using the Service</h2>
        <p className="mt-4 text-foreground/80 leading-relaxed">
          You may use the Service to make, manage, and communicate about
          bookings. You agree to provide accurate information and to use the
          Service only for lawful purposes. You must be at least 18 years old, or
          have the consent of a parent or guardian, to use the Service.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Bookings</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-foreground/80 leading-relaxed">
          <li>A booking is confirmed only once we send you a confirmation.</li>
          <li>You are responsible for the accuracy of the details you provide.</li>
          <li>Any cancellation or rescheduling terms will be communicated to you at the time of booking.</li>
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">WhatsApp messaging</h2>
        <p className="mt-4 text-foreground/80 leading-relaxed">
          By providing your WhatsApp number, you consent to receive messages
          from us relating to your bookings. Your use of WhatsApp is also subject
          to WhatsApp&rsquo;s own terms and policies. You can opt out of messages
          at any time by contacting us.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Privacy</h2>
        <p className="mt-4 text-foreground/80 leading-relaxed">
          Your use of the Service is also governed by our{" "}
          <Link
            href="/privacy"
            className="text-[var(--brand-start)] underline underline-offset-4"
          >
            Privacy Policy
          </Link>
          , which explains how we handle your personal data.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Acceptable use</h2>
        <p className="mt-4 text-foreground/80 leading-relaxed">
          You agree not to misuse the Service, including by attempting to disrupt
          it, access it without authorisation, or use it to send unlawful,
          abusive, or fraudulent content.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Limitation of liability</h2>
        <p className="mt-4 text-foreground/80 leading-relaxed">
          The Service is provided &ldquo;as is&rdquo; without warranties of any
          kind. To the fullest extent permitted by law, Solafidei is not liable
          for any indirect, incidental, or consequential damages arising from
          your use of the Service.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Changes to these Terms</h2>
        <p className="mt-4 text-foreground/80 leading-relaxed">
          We may update these Terms from time to time. We will post any changes
          on this page and update the effective date above. Your continued use of
          the Service after changes take effect constitutes acceptance of the
          updated Terms.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Contact us</h2>
        <p className="mt-4 text-foreground/80 leading-relaxed">
          If you have any questions about these Terms, contact us at{" "}
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
