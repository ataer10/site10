import { cn } from "@/lib/utils";
import { site } from "@/lib/site";

/** Endüstriyel kelime-marka: monolitik blok + sıkı grotesk tipografi. */
export function Logo({
  className,
  showTagline = false,
}: {
  className?: string;
  showTagline?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        aria-hidden
        className="grid size-8 place-items-center rounded-sm bg-ink-900 font-display text-base font-extrabold leading-none text-white"
      >
        B
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-display text-lg font-extrabold uppercase tracking-tight text-ink-900">
          {site.shortName}
          <span className="text-orange-500">.</span>
        </span>
        {showTagline ? (
          <span className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-400">
            {site.tagline}
          </span>
        ) : null}
      </span>
    </span>
  );
}
