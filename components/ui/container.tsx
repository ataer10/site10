import * as React from "react";
import { cn } from "@/lib/utils";

/** Sayfa genişlik sınırlayıcı — geniş B2B masaüstü öncelikli. */
export function Container({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8", className)}
      {...props}
    />
  );
}

/** Bölüm başlığı — küçük etiket (kicker) + başlık + açıklama. */
export function SectionHeading({
  kicker,
  title,
  description,
  className,
  align = "left",
}: {
  kicker?: string;
  title: string;
  description?: string;
  className?: string;
  align?: "left" | "center";
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      {kicker ? (
        <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-steel-500">
          <span className="h-px w-6 bg-steel-500" aria-hidden />
          {kicker}
        </span>
      ) : null}
      <h2 className="font-display text-2xl font-bold tracking-tight text-ink-900 text-balance sm:text-3xl">
        {title}
      </h2>
      {description ? (
        <p className="max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
  );
}
