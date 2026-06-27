import type { Metadata, Viewport } from "next";
import { Archivo, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { getSettings } from "@/lib/data/settings";
import { SITE_URL } from "@/lib/seo/url";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin", "latin-ext"],
  display: "swap",
  weight: ["600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
});

export const viewport: Viewport = {
  themeColor: "#1B4965",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSettings();
  const titleDefault = `${site.name} — ${site.tagline}`;
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: titleDefault, template: `%s | ${site.shortName}` },
    description: site.description,
    applicationName: site.name,
    keywords: [
      "endüstriyel tesisat malzemeleri",
      "vana",
      "küresel vana",
      "kelebek vana",
      "çek valf",
      "pompa",
      "sirkülasyon pompası",
      "boru",
      "fittings",
      "bağlantı elemanları",
      "manometre",
      "B2B tedarik",
      site.shortName,
    ],
    authors: [{ name: site.name }],
    creator: site.name,
    publisher: site.name,
    formatDetection: { telephone: true, address: true, email: true },
    openGraph: {
      type: "website",
      locale: "tr_TR",
      siteName: site.name,
      title: titleDefault,
      description: site.description,
      url: SITE_URL,
    },
    twitter: {
      card: "summary_large_image",
      title: titleDefault,
      description: site.description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    verification: process.env.GOOGLE_SITE_VERIFICATION
      ? { google: process.env.GOOGLE_SITE_VERIFICATION }
      : undefined,
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${inter.variable} ${archivo.variable} ${jetbrainsMono.variable} h-full`}
    >
      <body className="min-h-full bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
