import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agricultural Opportunities",
  description: "Explore preliminary agricultural opportunities and submit a non-binding expression of interest to ZD Crown."
};

export default function InvestLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
