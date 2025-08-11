import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import StarField from "./components/StarField";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
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
    icon: "/logo_smaller.png",
    shortcut: "/logo_smaller.png",
    apple: "/logo_smaller.png",
  },
  openGraph: {
    title: "Solafidei",
    description:
      "We design and build modern, intuitive web and mobile apps that help innovative companies launch and scale digital products with confidence.",
    url: "https://solafidei.com",
    siteName: "Solafidei",
    images: [
      {
        url: "/logo_smaller.png",
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
    images: ["/logo_smaller.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://solafidei.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <StarField />
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
              logo: "https://solafidei.com/logo_smaller.png",
              email: "info@solafidei.com",
              sameAs: [],
            }),
          }}
        />
      </body>
    </html>
  );
}
