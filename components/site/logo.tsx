import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Birtek Endüstriyel resmi logosu (public/img/logo.png — 1004×452, şeffaf).
 * - `onDark`: koyu zeminde (footer) beyaz kutu içinde gösterir.
 * - `light`: çerçevesiz, sinematik koyu hero üstünde okunması için beyaza çevirir
 *   (brightness-0 + invert → tek renk beyaz silüet). Renk geçişi header'da yapılır.
 */
export function Logo({
  className,
  onDark = false,
  light = false,
  priority = false,
}: {
  className?: string;
  onDark?: boolean;
  light?: boolean;
  priority?: boolean;
}) {
  const img = (
    <Image
      src="/img/logo-mark.png"
      alt="Birtek Endüstriyel — Kontrol Sistemleri ve Bağlantı Elemanları"
      width={1004}
      height={452}
      priority={priority}
      sizes="(min-width: 640px) 280px, 220px"
      className={cn(
        "h-full w-auto object-contain transition-[filter] duration-200 ease-[var(--ease-industrial)]",
        light && "[filter:brightness(0)_invert(1)]",
      )}
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
    <span className={cn("inline-flex h-[3.15rem] items-center sm:h-14", className)}>
      {img}
    </span>
  );
}
