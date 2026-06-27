import Image from "next/image";
import { Package } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Ürün görseli — görsel varsa next/image (object-contain, beyaz zemin),
 * yoksa nötr gri çerçeveli placeholder (tasarım dili: gri çerçeve).
 */
export function ProductImage({
  src,
  alt,
  sizes = "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw",
  className,
  priority = false,
}: {
  src: string | null;
  alt: string;
  sizes?: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative aspect-square w-full overflow-hidden bg-white",
        className,
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-contain p-4"
        />
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
