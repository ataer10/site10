"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  ArrowRight,
  ArrowDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Container } from "@/components/ui/container";
import { heroSlides, type HeroSlide } from "@/lib/content";
import { CommandBar } from "@/components/site/hero/command-bar";

const DURATION = 6000;

/** prefers-reduced-motion izleyici. */
function usePrefersReducedMotion() {
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

export function HeroSlider({ slides: slidesProp }: { slides?: HeroSlide[] }) {
  const slides = slidesProp && slidesProp.length > 0 ? slidesProp : heroSlides;
  const n = slides.length;
  const reduced = usePrefersReducedMotion();

  const [active, setActive] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const [userPaused, setUserPaused] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  const liveRef = React.useRef<HTMLParagraphElement>(null);

  // Otomatik ilerleme — kalan süre temelli (duraklatınca donar, sürünce kaldığı yerden).
  const timerRef = React.useRef<number | undefined>(undefined);
  const startRef = React.useRef(0);
  const remainRef = React.useRef(DURATION);

  const halted = paused || userPaused || reduced || n <= 1;

  const clearTimer = React.useCallback(() => {
    if (timerRef.current !== undefined) {
      window.clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }
  }, []);

  const startTimer = React.useCallback(() => {
    clearTimer();
    startRef.current = Date.now();
    timerRef.current = window.setTimeout(() => {
      setActive((i) => (i + 1) % n);
    }, remainRef.current);
  }, [clearTimer, n]);

  // Aktif slayt değişince süreyi sıfırla ve (uygunsa) başlat.
  React.useEffect(() => {
    remainRef.current = DURATION;
    if (!halted) startTimer();
    return clearTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  // Duraklat/sürdür durumları değişince.
  React.useEffect(() => {
    if (halted) {
      if (timerRef.current !== undefined) {
        remainRef.current = Math.max(
          0,
          remainRef.current - (Date.now() - startRef.current),
        );
        clearTimer();
      }
    } else {
      startTimer();
    }
    return clearTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [halted]);

  // İçerik ken-burns için ilk mount sonrası tetik.
  React.useEffect(() => {
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, []);

  // Sekme gizliyken duraklat.
  React.useEffect(() => {
    const onVis = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const go = React.useCallback(
    (dir: number) => setActive((i) => (i + dir + n) % n),
    [n],
  );
  const goTo = (i: number) => setActive(((i % n) + n) % n);

  // Klavye ← →
  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(-1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      go(1);
    }
  }

  // Dokunmatik / işaretçi swipe
  const downX = React.useRef<number | null>(null);
  function onPointerDown(e: React.PointerEvent) {
    downX.current = e.clientX;
  }
  function onPointerUp(e: React.PointerEvent) {
    if (downX.current === null) return;
    const dx = e.clientX - downX.current;
    downX.current = null;
    if (Math.abs(dx) > 44) go(dx < 0 ? 1 : -1);
  }

  const current = slides[active];

  return (
    <section
      className="birtek-slider relative isolate flex h-[92svh] min-h-[620px] flex-col overflow-hidden bg-ink-950"
      data-paused={halted ? "true" : "false"}
      aria-roledescription="carousel"
      aria-label="Öne çıkan ürün grupları"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onKeyDown={onKeyDown}
    >
      {/* Görsel katmanı */}
      <div
        className="absolute inset-0 z-0"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        {slides.map((s, i) => {
          const isActive = i === active;
          return (
            <div
              key={s.image}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} / ${n}`}
              aria-hidden={!isActive}
              className={cn(
                "absolute inset-0 transition-opacity duration-700 ease-[var(--ease-industrial)]",
                isActive ? "opacity-100" : "opacity-0",
              )}
            >
              <div className="absolute inset-0 overflow-hidden">
                <Image
                  src={s.image}
                  alt={s.imageAlt}
                  fill
                  preload={i === 0}
                  loading={i === 0 ? "eager" : "lazy"}
                  fetchPriority={i === 0 ? "high" : "auto"}
                  sizes="100vw"
                  className={cn(
                    "object-cover saturate-[.85]",
                    !reduced &&
                      "transition-transform ease-linear duration-[7200ms] will-change-transform",
                  )}
                  style={{
                    transform:
                      !reduced && isActive && mounted ? "scale(1.12)" : "scale(1)",
                  }}
                />
              </div>
              {/* Sinematik koyu gradient (okunabilirlik) */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    "linear-gradient(to top, rgb(13 14 18 / 0.86) 0%, rgb(13 14 18 / 0.45) 45%, rgb(13 14 18 / 0.35) 100%), linear-gradient(to right, rgb(13 14 18 / 0.72) 0%, rgb(13 14 18 / 0.10) 60%)",
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Teknik doku + köşe işaretleri */}
      <div className="pointer-events-none absolute inset-0 z-10 bg-blueprint opacity-40" aria-hidden />
      <div className="pointer-events-none absolute left-4 right-4 top-24 z-10 hidden h-px bg-white/10 lg:block" aria-hidden />

      {/* Canlı bölge (ekran okuyucu) */}
      <p ref={liveRef} aria-live="polite" className="sr-only">
        {`Slayt ${active + 1} / ${n}: ${current.tag}`}
      </p>

      {/* Ana içerik kolonu */}
      <div className="relative z-20 flex flex-1 flex-col">
        <Container className="flex flex-1 flex-col justify-center pb-8 pt-28">
          <div key={active} className="birtek-fadeup max-w-2xl">
            <p className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-steel-200">
              <span className="inline-block h-px w-8 bg-steel-300" />
              {current.tag}
            </p>
            <h1 className="mt-5 font-display text-[2.6rem] font-extrabold leading-[1.02] tracking-tight text-white text-balance sm:text-6xl xl:text-[4.2rem]">
              {current.title}{" "}
              <span className="text-steel-200">{current.accent}</span>
              {current.titleTail}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-100">
              {current.subtitle}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={current.cta.href}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-sm bg-accent px-6 text-base font-semibold text-accent-foreground transition-colors hover:bg-steel-600 active:bg-steel-700"
              >
                {current.cta.label}
                <ArrowRight className="size-4" strokeWidth={2} />
              </Link>
              {current.secondary ? (
                <Link
                  href={current.secondary.href}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-sm border border-white/30 px-6 text-base font-medium text-white transition-colors hover:border-white hover:bg-white/10"
                >
                  {current.secondary.label}
                </Link>
              ) : null}
            </div>
          </div>
        </Container>

        {/* Kontrol şeridi */}
        <Container className="pb-5">
          <div className="flex items-center justify-between gap-4">
            {/* Göstergeler + sayaç */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {slides.map((s, i) => (
                  <button
                    key={s.image}
                    type="button"
                    onClick={() => goTo(i)}
                    aria-label={`${i + 1}. slayda git`}
                    aria-current={i === active}
                    className="group py-2"
                  >
                    <span
                      className={cn(
                        "block h-[3px] overflow-hidden rounded-full bg-white/25 transition-all duration-300",
                        i === active ? "w-12" : "w-6 group-hover:bg-white/50",
                      )}
                    >
                      {i === active ? (
                        reduced ? (
                          <span className="block h-full w-full bg-white" />
                        ) : (
                          <span
                            key={`fill-${active}`}
                            className="birtek-fillbar block h-full w-full bg-white"
                            style={
                              {
                                "--birtek-dur": `${DURATION}ms`,
                              } as React.CSSProperties
                            }
                          />
                        )
                      ) : null}
                    </span>
                  </button>
                ))}
              </div>
              <span className="font-mono text-xs tabular-nums text-white/60">
                {String(active + 1).padStart(2, "0")}
                <span className="text-white/30"> / </span>
                {String(n).padStart(2, "0")}
              </span>
            </div>

            {/* Oynat/Duraklat + oklar */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setUserPaused((v) => !v)}
                aria-pressed={userPaused}
                aria-label={userPaused ? "Otomatik oynatmayı başlat" : "Otomatik oynatmayı duraklat"}
                className="grid size-9 place-items-center rounded-sm border border-white/20 text-white/80 transition-colors hover:border-white/50 hover:bg-white/10 hover:text-white"
              >
                {userPaused ? (
                  <Play className="size-4" strokeWidth={1.75} />
                ) : (
                  <Pause className="size-4" strokeWidth={1.75} />
                )}
              </button>
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Önceki slayt"
                className="grid size-9 place-items-center rounded-sm border border-white/20 text-white/80 transition-colors hover:border-white/50 hover:bg-white/10 hover:text-white"
              >
                <ChevronLeft className="size-4" strokeWidth={1.75} />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Sonraki slayt"
                className="grid size-9 place-items-center rounded-sm border border-white/20 text-white/80 transition-colors hover:border-white/50 hover:bg-white/10 hover:text-white"
              >
                <ChevronRight className="size-4" strokeWidth={1.75} />
              </button>
            </div>
          </div>
        </Container>
      </div>

      {/* Komuta çubuğu — slider alt kenarı */}
      <div className="relative z-30">
        <CommandBar />
      </div>

      {/* Kaydır ipucu */}
      <div className="pointer-events-none absolute bottom-[10.5rem] left-1/2 z-20 hidden -translate-x-1/2 flex-col items-center gap-1 text-white/45 lg:flex">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em]">Kaydır</span>
        <ArrowDown className="size-4 motion-safe:animate-bounce" strokeWidth={1.5} />
      </div>
    </section>
  );
}
