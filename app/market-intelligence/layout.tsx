import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Market Intelligence",
  description: "Follow administrator-curated commodity prices, agriculture news, export opportunities, and weather advisories."
};

export default function MarketIntelligenceLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
