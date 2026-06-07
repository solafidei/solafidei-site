import type { Metadata, Viewport } from "next";
import { DM_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://solafidei.com"),
  title: {
    default: "Solafidei",
    template: "%s | Solafidei",
  },
  description:
    "We design and build modern, intuitive web and mobile apps that help innovative companies launch and scale digital products with confidence.",
  icons: {
    icon: "/logo_opaque_smaller.png",
    shortcut: "/logo_opaque_smaller.png",
    apple: "/logo_opaque_smaller.png",
  },
  openGraph: {
    title: "Solafidei",
    description:
      "We design and build modern, intuitive web and mobile apps that help innovative companies launch and scale digital products with confidence.",
    url: "https://solafidei.com",
    siteName: "Solafidei",
    images: [
      {
        url: "/logo_opaque_smaller.png",
        width: 1200,
        height: 630,
        alt: "Solafidei",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Solafidei",
    description:
      "We design and build modern, intuitive web and mobile apps that help innovative companies launch and scale digital products with confidence.",
    images: ["/logo_opaque_smaller.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://solafidei.com",
  },
  other: {
    "facebook-domain-verification": "ue9rteh0x5yxy3ceywit8jk744vjpq",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${dmSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}>
        {/* base glow */}
        <div className="fixed inset-0 -z-10 bg-background [background:radial-gradient(110%_90%_at_50%_-10%,#6d4aae45_45%,transparent_80%)]" />
        {/* soft color blobs */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 -z-10"
          style={{
            background:
              "radial-gradient(circle at 15% 20%, #a78bfa2e, transparent 40%), radial-gradient(circle at 85% 70%, #7c3aed3a, transparent 45%)",
          }}
        />
        {/* subtle dot grid, fades out downward */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 -z-10"
          style={{
            backgroundImage:
              "radial-gradient(rgba(150,170,210,0.22) 1px, transparent 1px)",
            backgroundSize: "30px 30px",
            WebkitMaskImage:
              "radial-gradient(125% 95% at 50% 0%, #000 35%, transparent 78%)",
            maskImage:
              "radial-gradient(125% 95% at 50% 0%, #000 35%, transparent 78%)",
          }}
        />
        <Providers>{children}</Providers>
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Solafidei",
              url: "https://solafidei.com",
              logo: "https://solafidei.com/logo_opaque_smaller.png",
              email: "info@solafidei.com",
              sameAs: [],
            }),
          }}
        />
      </body>
    </html>
  );
}
