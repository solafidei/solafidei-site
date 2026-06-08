import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Solafidei collects, uses, and protects your personal data, including data handled through our booking system and WhatsApp service.",
  robots: { index: true, follow: true },
  alternates: { canonical: "https://solafidei.com/privacy" },
};

const SUPPORT_EMAIL = "info@solafidei.com";
const EFFECTIVE_DATE = "8 June 2026";

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl px-6 py-16 sm:py-24">
      <Link
        href="/"
        className="text-sm text-foreground/60 transition hover:text-foreground"
      >
        ← Back to home
      </Link>

      <h1 className="mt-8 bg-gradient-to-r from-[var(--brand-start)] to-[var(--brand-end)] bg-clip-text text-3xl font-semibold text-transparent sm:text-4xl">
        Privacy Policy
      </h1>
      <p className="mt-2 text-sm text-foreground/50">
        Effective date: {EFFECTIVE_DATE}
      </p>

      <p className="mt-6 text-foreground/80 leading-relaxed">
        Solafidei (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;)
        respects your privacy. This policy explains what personal data we
        collect, how we use it, and the rights you have over it. It applies to
        our website, our booking system, and our messaging service operated
        through WhatsApp.
      </p>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Information we collect</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-foreground/80 leading-relaxed">
          <li>Your name and contact details, including your WhatsApp phone number and email address.</li>
          <li>Booking details such as dates, services requested, and related notes.</li>
          <li>Messages you exchange with us through WhatsApp or our contact form.</li>
          <li>Basic technical data (such as IP address and browser type) when you visit our website.</li>
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">How we use your information</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-foreground/80 leading-relaxed">
          <li>To create, manage, and confirm your bookings.</li>
          <li>To communicate with you about your bookings via WhatsApp, email, or phone.</li>
          <li>To respond to your enquiries and provide customer support.</li>
          <li>To comply with our legal and regulatory obligations.</li>
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">How we share your information</h2>
        <p className="mt-4 text-foreground/80 leading-relaxed">
          We do not sell your personal data. We share it only with service
          providers that help us operate our service — such as Meta Platforms,
          Inc. (which provides the WhatsApp Business Platform) and our email and
          hosting providers — and only as needed to deliver the service. We may
          also disclose data where required by law.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Data retention</h2>
        <p className="mt-4 text-foreground/80 leading-relaxed">
          We keep your personal data only for as long as necessary to provide
          our services and to meet legal requirements. You can ask us to delete
          your data at any time — see our{" "}
          <Link
            href="/data-deletion"
            className="text-[var(--brand-start)] underline underline-offset-4"
          >
            Data Deletion Instructions
          </Link>
          .
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Your rights</h2>
        <p className="mt-4 text-foreground/80 leading-relaxed">
          Depending on your location, you may have the right to access, correct,
          or delete your personal data, and to object to or restrict certain
          processing. To exercise any of these rights, contact us at{" "}
          <a
            className="text-[var(--brand-start)] underline underline-offset-4"
            href={`mailto:${SUPPORT_EMAIL}`}
          >
            {SUPPORT_EMAIL}
          </a>
          .
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Security</h2>
        <p className="mt-4 text-foreground/80 leading-relaxed">
          We use reasonable technical and organisational measures to protect
          your personal data against unauthorised access, loss, or misuse. No
          method of transmission or storage is completely secure, but we work to
          protect your information.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Changes to this policy</h2>
        <p className="mt-4 text-foreground/80 leading-relaxed">
          We may update this policy from time to time. We will post any changes
          on this page and update the effective date above.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Contact us</h2>
        <p className="mt-4 text-foreground/80 leading-relaxed">
          If you have any questions about this Privacy Policy, contact us at{" "}
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
