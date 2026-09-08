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
  metadataBase: new URL("https://www.solafidei.com"),
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
    url: "https://www.solafidei.com",
    siteName: "Solafidei",
    images: [
      {
        url: "/logo_opaque_smaller.png",
        alt: "Solafidei",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
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
    canonical: "https://www.solafidei.com",
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
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": "https://www.solafidei.com/#studio",
                  name: "Solafidei",
                  alternateName:
                    "Solafidei Software Design & Development Studio",
                  description: metadata.description,
                  url: "https://www.solafidei.com",
                  logo: "https://www.solafidei.com/logo_opaque_smaller.png",
                  email: "info@solafidei.com",
                  legalName: "Solafidei",
                  foundingDate: "2025-10",
                  telephone: "+27690570000",
                  address: {
                    "@type": "PostalAddress",
                    addressLocality: "Pretoria",
                    addressCountry: "ZA",
                  },
                  // grounded in the service lines, stack and case studies
                  // rendered by Services.tsx and Proof.tsx — nothing else
                  knowsAbout: [
                    "Web & Mobile App Development",
                    "Product Discovery & UI/UX Design",
                    "Feature Development & Integration",
                    "Ongoing Support & Optimization",
                    "Next.js",
                    "React",
                    "React Native",
                    "Flutter",
                    ".NET / C#",
                    "Node.js",
                    "Python",
                    "AWS",
                    "GCP",
                    "Azure",
                    "Terraform",
                    "Firebase",
                    "PostgreSQL",
                    "Redis",
                    "Microservices architecture",
                    "CI/CD pipelines",
                    "Realtime chat and media pipelines",
                    "Push notification campaigns",
                    "Database migrations",
                  ],
                  sameAs: [
                    "https://github.com/solafidei",
                    "https://gitlab.com/solafidei",
                  ],
                },
                {
                  "@type": "WebSite",
                  "@id": "https://www.solafidei.com/#website",
                  name: "Solafidei",
                  url: "https://www.solafidei.com",
                  publisher: { "@id": "https://www.solafidei.com/#studio" },
                },
              ],
            }),
          }}
        />
      </body>
    </html>
  );
}
