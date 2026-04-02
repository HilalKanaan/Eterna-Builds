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
        setIsVisible(false);
        window.dispatchEvent(new CustomEvent("preloaderComplete"));
      },
    });

    // Phase 1: SVG logo stroke draw (0 - 1.5s)
    tl.to(paths, {
      strokeDashoffset: 0,
      duration: 1.5,
      stagger: 0.08,
      ease: "power2.inOut",
    });

    // Phase 1b: Fill in the logo after stroke completes
    tl.to(
      paths,
      {
        fill: "#f5f0e8",
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
        duration: 1.8,
        ease: "power2.inOut",
        onUpdate: () => {
          counter.textContent = String(Math.round(obj.val)).padStart(3, "0");
        },
      },
      "-=1.2"
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
      "-=1.0"
    );

    // Brief hold
    tl.to({}, { duration: 0.3 });

    // Phase 3: Fade out content
    tl.to(
      [svg, counter, brand],
      {
        opacity: 0,
        scale: 0.9,
        duration: 0.4,
        ease: "power2.in",
      }
    );

    // Phase 3b: Venetian blind curtain — bars retract upward with stagger
    tl.to(
      bars,
      {
        yPercent: -100,
        duration: 0.8,
        stagger: 0.08,
        ease: "power4.inOut",
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
        {/* SVG Logo — stroke-draw version */}
        <svg
          ref={svgRef}
          viewBox="0 0 200 240"
          className="w-20 h-20 md:w-28 md:h-28 mb-8"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* 3D Building block — top face */}
          <path
            d="M40 50 L100 20 L200 20 L140 50 Z"
            stroke="#f5f0e8"
            strokeWidth="1.5"
            fill="none"
          />
          {/* Front face - Floor 1 */}
          <path
            d="M40 50 L140 50 L140 95 L40 95 Z"
            stroke="#f5f0e8"
            strokeWidth="1.5"
            fill="none"
          />
          {/* Side face - Floor 1 */}
          <path
            d="M140 50 L200 20 L200 65 L140 95 Z"
            stroke="#f5f0e8"
            strokeWidth="1.5"
            fill="none"
          />
          {/* Front face - Floor 2 */}
          <path
            d="M40 105 L140 105 L140 150 L40 150 Z"
            stroke="#f5f0e8"
            strokeWidth="1.5"
            fill="none"
          />
          {/* Side face - Floor 2 */}
          <path
            d="M140 105 L200 75 L200 120 L140 150 Z"
            stroke="#f5f0e8"
            strokeWidth="1.5"
            fill="none"
          />
          {/* Front face - Floor 3 */}
          <path
            d="M40 160 L140 160 L140 210 L40 210 Z"
            stroke="#f5f0e8"
            strokeWidth="1.5"
            fill="none"
          />
          {/* Side face - Floor 3 */}
          <path
            d="M140 160 L200 130 L200 180 L140 210 Z"
            stroke="#f5f0e8"
            strokeWidth="1.5"
            fill="none"
          />
          {/* Bottom face */}
          <path
            d="M40 210 L140 210 L200 180 L100 180 Z"
            stroke="#f5f0e8"
            strokeWidth="1.5"
            fill="none"
          />
        </svg>

        {/* Counter */}
        <span
          ref={counterRef}
          className="font-heading text-beige/60 leading-none tracking-wider font-light"
          style={{ fontSize: "clamp(3rem, 10vw, 7rem)" }}
        >
          000
        </span>

        {/* Brand name */}
        <span
          ref={brandRef}
          className="absolute bottom-12 text-beige/50 text-xs tracking-[0.4em] uppercase font-heading"
        >
          Eterna Builds
        </span>
      </div>
    </div>
  );
}
