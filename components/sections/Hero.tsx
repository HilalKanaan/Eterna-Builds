"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { splitTextToChars } from "@/lib/splitText";
import HeroDistortion from "@/components/ui/HeroDistortion";

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const headingLine1Ref = useRef<HTMLDivElement>(null);
  const headingLine2Ref = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLSpanElement>(null);
  const locationRef = useRef<HTMLParagraphElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const [supportsWebGL, setSupportsWebGL] = useState(false);

  // Detect WebGL support on mount
  useEffect(() => {
    if (window.matchMedia("(hover: none)").matches) return;
    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (gl && navigator.hardwareConcurrency >= 4) {
        setSupportsWebGL(true);
      }
    } catch {
      // No WebGL support
    }
  }, []);

  // Mouse parallax on background
  useEffect(() => {
    if (window.matchMedia("(hover: none)").matches) return;

    const bg = bgRef.current;
    if (!bg) return;

    const xTo = gsap.quickTo(bg, "x", { duration: 1.2, ease: "power3" });
    const yTo = gsap.quickTo(bg, "y", { duration: 1.2, ease: "power3" });

    const handleMouseMove = (e: MouseEvent) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      xTo((e.clientX - centerX) * 0.02);
      yTo((e.clientY - centerY) * 0.02);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const bg = bgRef.current;
      if (!section || !bg) return;

      // The retracting preloader curtain is itself the reveal, so the image must
      // already be opaque behind it — fading it in from 0 leaves a visible gap
      // where the page background shows through. Only the scale settles.
      gsap.set(bg, { scale: 1.3, willChange: "transform" });

      // Wait for preloader to finish
      const runAnimations = () => {
        const tl = gsap.timeline();

        // Image settle â€” GPU-composited scale, no opacity gap
        tl.to(bg, {
          scale: 1.1,
          duration: 1.6,
          ease: "power3.out",
          clearProps: "willChange",
        });

        // Subtitle fade in
        tl.fromTo(
          subtitleRef.current,
          { yPercent: 100, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
          "-=0.6"
        );

        // Character-level heading animation â€” Line 1
        if (headingLine1Ref.current) {
          const chars1 = splitTextToChars(headingLine1Ref.current);
          tl.fromTo(
            chars1,
            { yPercent: 120, rotateX: 80, opacity: 0 },
            {
              yPercent: 0,
              rotateX: 0,
              opacity: 1,
              stagger: 0.03,
              duration: 0.9,
              ease: "power4.out",
            },
            "-=0.5"
          );
        }

        // Character-level heading animation â€” Line 2
        if (headingLine2Ref.current) {
          const chars2 = splitTextToChars(headingLine2Ref.current);
          tl.fromTo(
            chars2,
            { yPercent: 120, rotateX: 80, opacity: 0 },
            {
              yPercent: 0,
              rotateX: 0,
              opacity: 1,
              stagger: 0.03,
              duration: 0.9,
              ease: "power4.out",
            },
            "-=0.7"
          );
        }

        // Location text
        tl.fromTo(
          locationRef.current,
          { yPercent: 50, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
          "-=0.5"
        );

        // Scroll indicator â€” fade in, then set up fade-out on scroll after entrance completes
        tl.fromTo(
          scrollIndicatorRef.current,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.6,
            onComplete: () => {
              gsap.to(scrollIndicatorRef.current, {
                opacity: 0,
                y: 20,
                scrollTrigger: {
                  trigger: section,
                  start: "2% top",
                  end: "15% top",
                  scrub: true,
                },
              });
            },
          },
          "-=0.3"
        );
      };

      // Ensure animations only run once
      let hasRun = false;
      const safeRunAnimations = () => {
        if (hasRun) return;
        hasRun = true;
        runAnimations();
      };

      // Preloader may have already finished (or been skipped this session)
      if ((window as Window & { __ebPreloaderDone?: boolean }).__ebPreloaderDone) {
        safeRunAnimations();
      }

      // Listen for preloader complete event
      window.addEventListener("preloaderComplete", safeRunAnimations);

      // Fallback if the event never arrives
      const timeout = setTimeout(safeRunAnimations, 3200);

      // Scroll parallax on background
      gsap.to(bg, {
        yPercent: -20,
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });

      // Pin hero and scale down as About slides over
      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "+=60%",
        pin: true,
        pinSpacing: false,
        onUpdate: (self) => {
          gsap.set(overlayRef.current, {
            scale: 1 - self.progress * 0.08,
            opacity: 1 - self.progress * 0.6,
          });
        },
      });

      return () => {
        window.removeEventListener("preloaderComplete", safeRunAnimations);
        clearTimeout(timeout);
      };
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="relative h-screen w-full overflow-hidden"
      id="home"
    >
      <div ref={overlayRef} className="relative h-full w-full" style={{ willChange: "transform, opacity" }}>
        {/* Background â€” WebGL distortion or static fallback */}
        <div ref={bgRef} className="absolute inset-0 scale-110">
          {/* Priority image always mounted for instant LCP; WebGL layer fades in on top */}
          <Image
            src="/images/hero.webp"
            alt="Luxury modern interior"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          {supportsWebGL && (
            <HeroDistortion
              imageSrc="/images/hero.webp"
              className="object-cover"
            />
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-deep-green/50 via-deep-green/20 to-deep-green/60" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 sm:px-6 text-center">
          {/* Subtitle */}
          <div className="overflow-hidden mb-6">
            <span
              ref={subtitleRef}
              className="inline-block text-sm tracking-[0.35em] uppercase text-sage font-heading"
            >
              Interior Design & Architecture
            </span>
          </div>

          {/* Main heading */}
          <h1
            className="font-heading font-bold text-light-grey leading-[0.95]"
            style={{
              fontSize: "clamp(1.75rem, 6.5vw, 5.5rem)",
              perspective: "400px",
            }}
          >
            <div className="overflow-hidden">
              <div ref={headingLine1Ref}>Spaces that</div>
            </div>
            <div className="overflow-hidden">
              <div ref={headingLine2Ref} className="italic text-sage">
                Understand you
              </div>
            </div>
          </h1>

          {/* Location */}
          <p
            ref={locationRef}
            className="mt-8 text-light-grey/60 text-sm tracking-[0.25em] uppercase font-heading"
          >
            Lebanon &mdash; Saudi Arabia
          </p>
        </div>

        {/* Scroll Indicator */}
        <div
          ref={scrollIndicatorRef}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-5 opacity-0"
          data-cursor-text="Scroll"
        >
          {/* Glowing pill badge */}
          <div className="relative">
            <div className="absolute inset-0 bg-sage/30 rounded-full blur-xl animate-pulse-soft" />
            <div className="relative px-6 py-2.5 border border-sage/50 rounded-full bg-sage/10 backdrop-blur-sm">
              <span className="text-sage text-sm font-heading font-semibold tracking-[0.3em] uppercase">
                Scroll down
              </span>
            </div>
          </div>

          {/* Animated chevrons */}
          <div className="flex flex-col items-center gap-1 animate-scroll-bounce">
            <svg width="20" height="10" viewBox="0 0 20 10" fill="none" className="text-sage opacity-40">
              <path d="M1 1L10 8L19 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <svg width="20" height="10" viewBox="0 0 20 10" fill="none" className="text-sage opacity-70">
              <path d="M1 1L10 8L19 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <svg width="20" height="10" viewBox="0 0 20 10" fill="none" className="text-sage">
              <path d="M1 1L10 8L19 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
