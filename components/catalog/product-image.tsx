import Image from "next/image";
import { Package } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Ürün görseli:
 *  - Gerçek görsel (src) → next/image object-contain, beyaz zemin.
 *  - Yoksa temsili görsel (fallbackSrc) → object-cover + "temsili" etiketi.
 *  - O da yoksa → nötr gri placeholder.
 */
export function ProductImage({
  src,
  fallbackSrc = null,
  alt,
  sizes = "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw",
  className,
  priority = false,
}: {
  src: string | null;
  fallbackSrc?: string | null;
  alt: string;
  sizes?: string;
  className?: string;
  priority?: boolean;
}) {
  const effective = src ?? fallbackSrc;
  const isReal = Boolean(src);

  return (
    <div
      className={cn(
        "relative aspect-square w-full overflow-hidden bg-white",
        className,
      )}
    >
      {effective ? (
        <>
          <Image
            src={effective}
            alt={alt}
            fill
            sizes={sizes}
            priority={priority}
            className={isReal ? "object-contain p-4" : "object-cover"}
          />
          {!isReal ? (
            <span className="absolute left-1.5 top-1.5 rounded-sm bg-ink-900/75 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide text-white/90 backdrop-blur">
              Temsili
            </span>
          ) : null}
        </>
      ) : (
        <div className="absolute inset-0 grid place-items-center bg-ink-50">
          <div className="flex flex-col items-center gap-2 text-ink-300">
            <Package className="size-10" strokeWidth={1.25} />
            <span className="font-mono text-[10px] uppercase tracking-[0.16em]">
              Görsel yok
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
