import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agricultural Services",
  description: "Search agricultural equipment, training, logistics, warehousing, input supply, smart farming, and community services."
};

export default function ServicesLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
