"use client";

import { useRef, useEffect } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export default function ScrollGuide() {
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const progress = progressRef.current;
    const arrow = arrowRef.current;
    if (!container || !progress || !arrow) return;

    // Fade in after preloader
    const show = () => {
      gsap.to(container, { opacity: 1, x: 0, duration: 0.8, delay: 4, ease: "power3.out" });
    };

    window.addEventListener("preloaderComplete", show);
    const fallback = setTimeout(show, 6000);

    // Bounce the arrow forever
    gsap.to(arrow, {
      y: 6,
      duration: 0.8,
      ease: "power1.inOut",
      repeat: -1,
      yoyo: true,
    });

    // Progress bar tracks scroll position
    ScrollTrigger.create({
      trigger: document.body,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        gsap.set(progress, { scaleY: self.progress });

        // Hide near the footer (last 5%)
        if (self.progress > 0.95) {
          gsap.to(container, { opacity: 0, duration: 0.3, overwrite: true });
        } else if (container.style.opacity !== "0") {
          gsap.to(container, { opacity: 1, duration: 0.3, overwrite: true });
        }
      },
    });

    return () => {
      window.removeEventListener("preloaderComplete", show);
      clearTimeout(fallback);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed right-5 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-center gap-4 opacity-0 translate-x-4"
    >
      {/* Label */}
      <span
        className="text-[11px] font-heading font-semibold tracking-[0.25em] uppercase"
        style={{
          writingMode: "vertical-rl",
          color: "var(--color-minted-grey)",
        }}
      >
        Keep scrolling
      </span>

      {/* Progress track */}
      <div className="relative w-[3px] h-32 bg-charcoal/15 rounded-full overflow-hidden">
        <div
          ref={progressRef}
          className="absolute top-0 left-0 w-full h-full rounded-full origin-top"
          style={{
            transform: "scaleY(0)",
            background: "var(--color-minted-grey)",
          }}
        />
      </div>

      {/* Animated arrow */}
      <div ref={arrowRef} className="flex flex-col items-center gap-0.5">
        <svg width="14" height="8" viewBox="0 0 14 8" fill="none">
          <path d="M1 1L7 6L13 1" stroke="var(--color-minted-grey)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
        </svg>
        <svg width="14" height="8" viewBox="0 0 14 8" fill="none">
          <path d="M1 1L7 6L13 1" stroke="var(--color-minted-grey)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );
}
