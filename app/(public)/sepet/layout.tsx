import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Teklif Sepeti",
  robots: { index: false, follow: true },
  alternates: { canonical: "/sepet" },
};

export default function SepetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
