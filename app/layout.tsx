import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ZD Crown Agro Marketplace",
    template: "%s | ZD Crown"
  },
  description: "Buy agricultural produce, explore managed services, follow Nigerian market intelligence, and register interest in opportunities with ZD Crown.",
  openGraph: {
    type: "website",
    siteName: "ZD Crown",
    title: "ZD Crown Agro Marketplace",
    description: "A trusted agro marketplace for produce, services, market intelligence, and opportunities.",
    url: siteUrl
  },
  robots: { index: true, follow: true }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <a href="#main-content" className="sr-only fixed left-4 top-4 z-[100] rounded-md bg-forest-950 px-4 py-3 font-bold text-white focus:not-sr-only">
          Skip to main content
        </a>
        <Providers><div id="main-content" tabIndex={-1}>{children}</div></Providers>
      </body>
    </html>
  );
}
