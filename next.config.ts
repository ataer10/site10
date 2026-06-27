import type { NextConfig } from "next";

/**
 * Supabase Storage görselleri için izinli uzak kalıplar.
 * Public bucket yolu: https://<project>.supabase.co/storage/v1/object/public/**
 */
const remotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
  {
    protocol: "https",
    hostname: "**.supabase.co",
    pathname: "/storage/v1/object/public/**",
  },
];

// Yapılandırılmış proje host'unu da açıkça ekle (özel domain vb.)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (supabaseUrl) {
  try {
    const { hostname } = new URL(supabaseUrl);
    if (!hostname.endsWith(".supabase.co")) {
      remotePatterns.push({
        protocol: "https",
        hostname,
        pathname: "/storage/v1/object/public/**",
      });
    }
  } catch {
    // geçersiz URL — yok say
  }
}

const nextConfig: NextConfig = {
  images: { remotePatterns },
};

export default nextConfig;
