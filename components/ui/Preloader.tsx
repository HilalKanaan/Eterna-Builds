"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";

const BAR_COUNT = 5;

export default function Preloader() {
  const preloaderRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const brandRef = useRef<HTMLSpanElement>(null);
  const barsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Skip the intro on repeat visits within the same session — visitors
    // shouldn't wait for the animation more than once.
    if (sessionStorage.getItem("eb-preloader-seen")) {
      (window as Window & { __ebPreloaderDone?: boolean }).__ebPreloaderDone = true;
      setIsVisible(false);
      requestAnimationFrame(() => {
        window.dispatchEvent(new CustomEvent("preloaderComplete"));
      });
      return;
    }

    const preloader = preloaderRef.current;
    const counter = counterRef.current;
    const svg = svgRef.current;
    const brand = brandRef.current;
    if (!preloader || !counter || !svg || !brand) return;

    // Get all SVG paths for stroke animation
    const paths = svg.querySelectorAll<SVGPathElement>("path");
    paths.forEach((path) => {
      const length = path.getTotalLength();
      path.style.strokeDasharray = `${length}`;
      path.style.strokeDashoffset = `${length}`;
    });

    // Get brand text chars
    const brandText = brand.textContent || "";
    brand.textContent = "";
    const brandChars: HTMLSpanElement[] = [];
    for (const char of brandText) {
      const span = document.createElement("span");
      span.style.display = "inline-block";
      span.style.opacity = "0";
      span.style.transform = "translateY(20px)";
      if (char === " ") {
        span.innerHTML = "&nbsp;";
      } else {
        span.textContent = char;
      }
      brand.appendChild(span);
      brandChars.push(span);
    }

    const bars = barsRef.current.filter(Boolean) as HTMLDivElement[];
    const obj = { val: 0 };

    const tl = gsap.timeline({
      onComplete: () => {
        sessionStorage.setItem("eb-preloader-seen", "1");
        setIsVisible(false);
      },
    });

    // Phase 1: SVG logo stroke draw
    tl.to(paths, {
      strokeDashoffset: 0,
      duration: 0.8,
      stagger: 0.05,
      ease: "power2.inOut",
    });

    // Phase 1b: Fill in the logo with its true brand colors after stroke completes
    tl.to(
      paths,
      {
        fill: (_i: number, el: SVGPathElement) => el.dataset.fill || "#f7f9f9",
        stroke: "transparent",
        duration: 0.4,
        stagger: 0.03,
        ease: "power1.in",
      },
      "-=0.3"
    );

    // Phase 2: Counter counts 0 → 100 (overlapping with end of stroke)
    tl.to(
      obj,
      {
        val: 100,
        duration: 1.0,
        ease: "power2.inOut",
        onUpdate: () => {
          counter.textContent = String(Math.round(obj.val)).padStart(3, "0");
        },
      },
      "-=0.8"
    );

    // Phase 2b: Brand text chars fade in letter by letter
    tl.to(
      brandChars,
      {
        opacity: 1,
        y: 0,
        stagger: 0.03,
        duration: 0.4,
        ease: "power3.out",
      },
      "-=0.7"
    );

    // Brief hold
    tl.to({}, { duration: 0.15 });

    // Phase 3: Fade out content
    tl.to(
      [svg, counter, brand],
      {
        opacity: 0,
        scale: 0.9,
        duration: 0.35,
        ease: "power2.in",
      }
    );

    // Phase 3b: Venetian blind curtain — bars retract upward with stagger.
    // The hero reveal is triggered as the curtain *starts* opening so the two
    // overlap; waiting until the curtain is fully open leaves a bare frame.
    tl.to(
      bars,
      {
        yPercent: -100,
        duration: 0.6,
        stagger: 0.06,
        ease: "power4.inOut",
        onStart: () => {
          (window as Window & { __ebPreloaderDone?: boolean }).__ebPreloaderDone = true;
          window.dispatchEvent(new CustomEvent("preloaderComplete"));
        },
      },
      "-=0.1"
    );

    return () => {
      tl.kill();
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div ref={preloaderRef} className="fixed inset-0 z-[100]">
      {/* Venetian blind bars */}
      {Array.from({ length: BAR_COUNT }).map((_, i) => (
        <div
          key={i}
          ref={(el) => { barsRef.current[i] = el; }}
          className="absolute left-0 right-0 bg-charcoal"
          style={{
            top: `${i * (100 / BAR_COUNT)}%`,
            height: `${100 / BAR_COUNT + 0.5}%`, // slight overlap to prevent gaps
          }}
        />
      ))}

      {/* Content overlay */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
        {/* SVG Logo — stroke-draw version, traced from the official Eterna Builds logo */}
        <svg
          ref={svgRef}
          viewBox="0 0 374 310"
          className="w-24 md:w-32 h-auto mb-8"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Top slab — front face */}
          <path
            d="M11 89 L260 1 L260 82 L11 145 Z"
            data-fill="#21504E"
            stroke="#f7f9f9"
            strokeWidth="1.5"
            fill="none"
          />
          {/* Top slab — side face */}
          <path
            d="M260 1 L363 97 L363 150 L260 82 Z"
            data-fill="#163531"
            stroke="#f7f9f9"
            strokeWidth="1.5"
            fill="none"
          />
          {/* Middle slab — front face */}
          <path
            d="M11 170 L215 125 L215 198 L11 226 Z"
            data-fill="#21504E"
            stroke="#f7f9f9"
            strokeWidth="1.5"
            fill="none"
          />
          {/* Middle slab — side face */}
          <path
            d="M215 125 L363 178 L363 230 L215 198 Z"
            data-fill="#163531"
            stroke="#f7f9f9"
            strokeWidth="1.5"
            fill="none"
          />
          {/* Bottom slab — front face */}
          <path
            d="M11 253 L148 242 L148 308 L11 308 Z"
            data-fill="#21504E"
            stroke="#f7f9f9"
            strokeWidth="1.5"
            fill="none"
          />
          {/* Bottom slab — side face */}
          <path
            d="M148 242 L363 257 L363 308 L148 308 Z"
            data-fill="#163531"
            stroke="#f7f9f9"
            strokeWidth="1.5"
            fill="none"
          />
        </svg>

        {/* Counter */}
        <span
          ref={counterRef}
          className="font-heading text-light-grey/60 leading-none tracking-wider font-light"
          style={{ fontSize: "clamp(3rem, 10vw, 7rem)" }}
        >
          000
        </span>

        {/* Brand name */}
        <span
          ref={brandRef}
          className="absolute bottom-12 text-light-grey/50 text-xs tracking-[0.4em] uppercase font-heading"
        >
          Eterna Builds
        </span>
      </div>
    </div>
  );
}
