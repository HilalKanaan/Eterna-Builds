"use client";

import { useRef } from "react";
import Image from "next/image";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { GALLERY_ITEMS, BRAND } from "@/lib/constants";
import { clamp } from "@/lib/utils";
import { splitTextToChars } from "@/lib/splitText";
import TiltCard from "@/components/ui/TiltCard";

// Reveal animation variations — GPU-composited (opacity + transform only)
const REVEAL_VARIANTS = [
  { fromX: "-30%", fromScale: 0.92 },
  { fromX: "0%",   fromScale: 0.85 },
  { fromX: "30%",  fromScale: 0.92 },
  { fromX: "0%",   fromScale: 0.88 },
  { fromX: "-20%", fromScale: 0.9  },
];

export default function Gallery() {
  const sectionRef = useRef<HTMLElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const slider = sliderRef.current;
      if (!section || !slider) return;

      // Character-level title reveal
      const titleEl = section.querySelector(".gallery-title");
      if (titleEl) {
        const chars = splitTextToChars(titleEl as HTMLElement);
        gsap.fromTo(
          chars,
          { yPercent: 100, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            stagger: 0.03,
            duration: 0.7,
            ease: "power4.out",
            scrollTrigger: {
              trigger: section,
              start: "top 80%",
            },
          }
        );
      }

      // Only enable horizontal scroll on desktop
      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px)", () => {
        const totalWidth = slider.scrollWidth;
        const viewportWidth = window.innerWidth;

        // Promote slider to its own GPU layer for smooth horizontal scroll
        gsap.set(slider, { willChange: "transform" });

        const horizontalTween = gsap.to(slider, {
          x: -(totalWidth - viewportWidth),
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${totalWidth - viewportWidth}`,
            pin: true,
            scrub: 0.5,
            invalidateOnRefresh: true,
            anticipatePin: 1,
            onUpdate: (self) => {
              // Update progress bar
              if (progressRef.current) {
                gsap.set(progressRef.current, {
                  scaleX: self.progress,
                });
              }
            },
          },
        });

        // Lightweight skew effect — only applied via the main tween's velocity
        const images = slider.querySelectorAll(".gallery-image");
        const skewSetter = gsap.quickSetter(images, "skewX", "deg");
        let lastVelocity = 0;

        // Use GSAP ticker instead of separate ScrollTrigger for velocity effects
        const tickerCallback = () => {
          const st = horizontalTween.scrollTrigger;
          if (!st) return;
          const velocity = st.getVelocity();
          // Only update if velocity changed meaningfully (skip idle frames)
          if (Math.abs(velocity - lastVelocity) > 10) {
            lastVelocity = velocity;
            skewSetter(clamp(velocity / -300, -5, 5));
          }
          // Auto-reset skew when stopped
          if (Math.abs(velocity) < 5 && Math.abs(lastVelocity) > 5) {
            gsap.to(images, { skewX: 0, duration: 0.6, ease: "power2.out", overwrite: true });
          }
        };
        gsap.ticker.add(tickerCallback);

        // GPU-composited image reveal animations using containerAnimation
        const galleryImages = slider.querySelectorAll(".gallery-reveal");
        galleryImages.forEach((img, i) => {
          const variant = REVEAL_VARIANTS[i % REVEAL_VARIANTS.length];
          gsap.set(img, { opacity: 0, scale: variant.fromScale, xPercent: parseFloat(variant.fromX), willChange: "transform, opacity" });

          ScrollTrigger.create({
            trigger: img,
            containerAnimation: horizontalTween,
            start: "left 90%",
            onEnter: () => {
              gsap.to(img, {
                opacity: 1,
                scale: 1,
                xPercent: 0,
                duration: 1.2,
                ease: "power3.out",
                clearProps: "willChange",
              });
            },
          });
        });

        return () => {
          gsap.ticker.remove(tickerCallback);
          horizontalTween.scrollTrigger?.kill();
        };
      });
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="relative bg-cream overflow-x-hidden md:overflow-x-visible" id="work">
      {/* Section Header */}
      <div className="pt-24 md:pt-0 md:absolute md:top-12 md:left-12 z-20">
        <span className="text-xs tracking-[0.35em] uppercase text-forest font-heading px-6 md:px-0">
          Our Work
        </span>
        <div className="overflow-hidden">
          <h2
            className="gallery-title font-heading font-bold text-charcoal mt-3 px-6 md:px-0"
            style={{
              fontSize: "clamp(2rem, 4vw, 3.5rem)",
              perspective: "400px",
            }}
          >
            Selected Projects
          </h2>
        </div>
      </div>

      {/* Background Text — static decorative element */}
      <div className="hidden md:block absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <p
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-heading font-bold text-forest/[0.04] select-none"
          style={{ fontSize: "clamp(8rem, 18vw, 20rem)" }}
        >
          {BRAND.taglines.gallery}
        </p>
      </div>

      {/* Horizontal Slider (Desktop) / Vertical Cards (Mobile) */}
      <div
        ref={sliderRef}
        className="flex flex-col md:flex-row md:h-screen md:items-center gap-6 md:gap-8 px-6 md:px-16 md:pl-16 md:pr-16 py-8 md:py-0 md:pt-24 md:w-fit"
        data-cursor-text="Drag"
      >
        {/* Spacer for section header on desktop */}
        <div className="hidden md:block min-w-[25vw] flex-shrink-0" />

        {GALLERY_ITEMS.map((item, i) => (
          <div
            key={i}
            className="gallery-item w-full max-w-full md:w-[45vw] lg:w-[35vw] flex-shrink-0"
            data-cursor-text="View"
          >
            <TiltCard className="gallery-image relative overflow-hidden rounded-lg aspect-[3/4] md:aspect-[4/5]">
              <div className="gallery-reveal absolute inset-0">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 45vw"
                />
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                  <span className="text-xs tracking-[0.3em] uppercase text-amber font-heading">
                    {item.subtitle}
                  </span>
                </div>
              </div>
            </TiltCard>
            <div className="mt-4">
              <h3 className="font-heading text-xl sm:text-2xl font-semibold text-charcoal">
                {item.title}
              </h3>
              <p className="text-charcoal/50 text-sm mt-1 font-heading tracking-wider uppercase">
                {item.subtitle}
              </p>
            </div>
          </div>
        ))}

        {/* End spacer */}
        <div className="hidden md:block min-w-[10vw] flex-shrink-0" />
      </div>

      {/* Progress Bar (Desktop only) */}
      <div className="hidden md:block absolute bottom-8 left-12 right-12 z-20">
        <div className="h-[2px] bg-charcoal/10 rounded-full overflow-hidden">
          <div
            ref={progressRef}
            className="h-full bg-forest origin-left"
            style={{ transform: "scaleX(0)", willChange: "transform" }}
          />
        </div>
      </div>
    </section>
  );
}
