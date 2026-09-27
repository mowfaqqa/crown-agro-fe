import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agricultural Marketplace",
  description: "Browse verified agricultural produce by category, country, certification, availability, and price."
};

export default function MarketplaceLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
