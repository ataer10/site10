import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Birtek Endüstriyel resmi logosu (public/img/logo.png — 1004×452, şeffaf).
 * `onDark`: koyu zeminde (footer) okunması için beyaz kutu içinde gösterir.
 */
export function Logo({
  className,
  onDark = false,
  priority = false,
}: {
  className?: string;
  onDark?: boolean;
  priority?: boolean;
}) {
  const img = (
    <Image
      src="/img/logo.png"
      alt="Birtek Endüstriyel — Kontrol Sistemleri ve Bağlantı Elemanları"
      width={1004}
      height={452}
      priority={priority}
      sizes="(min-width: 640px) 200px, 160px"
      className="h-full w-auto object-contain"
    />
  );

  if (onDark) {
    return (
      <span
        className={cn(
          "inline-flex h-11 items-center rounded-sm bg-white px-3 py-1.5",
          className,
        )}
      >
        {img}
      </span>
    );
  }

  return (
    <span className={cn("inline-flex h-9 items-center sm:h-10", className)}>
      {img}
    </span>
  );
}
