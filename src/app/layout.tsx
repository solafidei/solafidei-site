import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { SplashScreen } from "./components/SplashScreen";
import { FluidCursor } from "./components/FluidCursor";

// Montserrat drives every font token site-wide (see globals.css)
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
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
      <body className={`${montserrat.variable} antialiased bg-background text-foreground`}>
        {/* full-screen intro splash with the logo; sits above all content */}
        <SplashScreen durationMs={1200} />
        {/* cursor-driven fluid overlay (disabled for reduced-motion) */}
        <FluidCursor />
        {/* subtle purple wash (ties to the splash); behind all content */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 -z-10"
          style={{
            background:
              "radial-gradient(110% 70% at 50% 0%, rgba(124,58,237,0.18), transparent 70%)",
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
