import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Teklif İste",
  robots: { index: false, follow: true },
  alternates: { canonical: "/teklif-iste" },
};

export default function TeklifIsteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
