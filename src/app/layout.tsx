import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { SplashScreen } from "./components/SplashScreen";
import { SmoothScroll } from "./components/SmoothScroll";
import { Analytics } from "@vercel/analytics/next"

// Type system: Space Grotesk headings, Inter body, JetBrains Mono details
// (see globals.css for the token mapping)
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
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
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} antialiased bg-background text-foreground`}
      >
        {/* short branded ident, once per session; hero entrance waits for it
            (?splash=on / ?splash=off to force either mode) */}
        <Analytics />
        <SplashScreen durationMs={900} />
        <SmoothScroll />
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
