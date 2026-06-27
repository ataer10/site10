import Image from "next/image";
import { cn } from "@/lib/utils";

/** ink-950 = #0d0e12 → rgb(13 14 18). Scrim'ler için inline gradient. */
const GRADIENTS = {
  bottom:
    "linear-gradient(to top, rgb(13 14 18 / 0.92) 0%, rgb(13 14 18 / 0.35) 45%, rgb(13 14 18 / 0.05) 100%)",
  left: "linear-gradient(to right, rgb(13 14 18 / 0.86) 0%, rgb(13 14 18 / 0.5) 45%, rgb(13 14 18 / 0.15) 100%)",
} as const;

type Overlay = "dark" | "darker" | "bottom" | "left" | "none";

/**
 * Dekoratif / arka plan görseli — kapsayıcı `relative` olmalı.
 * Tüm görsellere ortak işleme: object-cover + hafif doygunluk düşümü
 * (saturate-[.9]) + okunabilirlik için koyu overlay. Karışık renk sıcaklıkları
 * (turuncu/mavi/sarı) böylece aynı aileye oturur.
 */
export function CoverImage({
  src,
  alt = "",
  priority = false,
  sizes = "100vw",
  overlay = "dark",
  className,
}: {
  src: string;
  alt?: string;
  priority?: boolean;
  sizes?: string;
  overlay?: Overlay;
  className?: string;
}) {
  const decorative = alt === "";
  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      aria-hidden={decorative || undefined}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className="object-cover saturate-[.9]"
      />
      {overlay === "dark" ? <div className="absolute inset-0 bg-ink-950/70" /> : null}
      {overlay === "darker" ? <div className="absolute inset-0 bg-ink-950/82" /> : null}
      {overlay === "bottom" ? (
        <div className="absolute inset-0" style={{ backgroundImage: GRADIENTS.bottom }} />
      ) : null}
      {overlay === "left" ? (
        <div className="absolute inset-0" style={{ backgroundImage: GRADIENTS.left }} />
      ) : null}
    </div>
  );
}
