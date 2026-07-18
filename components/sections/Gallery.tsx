"use client";

import { useRef } from "react";
import Image from "next/image";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { GALLERY_ITEMS, BRAND } from "@/lib/constants";
import { clamp } from "@/lib/utils";
import { splitTextToChars } from "@/lib/splitText";
import TiltCard from "@/components/ui/TiltCard";

// Clip-path reveal patterns — each gallery item gets a unique one
const REVEAL_PATTERNS = [
  {
    from: "polygon(0 0, 0 0, 0 100%, 0 100%)",
    to: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
  },
  {
    from: "circle(0% at 50% 50%)",
    to: "circle(75% at 50% 50%)",
  },
  {
    from: "inset(50% 50% 50% 50%)",
    to: "inset(0% 0% 0% 0%)",
  },
  {
    from: "polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)",
    to: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
  },
  {
    from: "inset(0 50% 0 50%)",
    to: "inset(0 0% 0 0%)",
  },
];

export default function Gallery() {
  const sectionRef = useRef<HTMLElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const bgTextRef = useRef<HTMLParagraphElement>(null);

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

        const horizontalTween = gsap.to(slider, {
          x: -(totalWidth - viewportWidth),
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${totalWidth - viewportWidth}`,
            pin: true,
            scrub: 1,
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

        // Skew effect on images while scrolling
        const images = slider.querySelectorAll(".gallery-image");
        const skewSetter = gsap.quickSetter(images, "skewX", "deg");
        const clampSkew = (v: number) => clamp(v, -5, 5);

        // Scroll-velocity background text effect
        const bgText = bgTextRef.current;
        let bgSkewSetter: ReturnType<typeof gsap.quickSetter> | null = null;
        if (bgText) {
          bgSkewSetter = gsap.quickSetter(bgText, "skewX", "deg");
        }

        ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: () => `+=${totalWidth - viewportWidth}`,
          onUpdate: (self) => {
            const velocity = self.getVelocity();
            const skew = clampSkew(velocity / -300);
            skewSetter(skew);

            // Velocity-driven background text distortion
            if (bgText && bgSkewSetter) {
              const bgSkew = clamp(velocity / -500, -8, 8);
              bgSkewSetter(bgSkew);
              const scaleX = clamp(1 + Math.abs(velocity) / 50000, 1, 1.06);
              bgText.style.transform = `translate(-50%, -50%) skewX(${bgSkew}deg) scaleX(${scaleX})`;
            }
          },
        });

        // Reset skew when scrolling stops
        ScrollTrigger.addEventListener("scrollEnd", () => {
          gsap.to(images, {
            skewX: 0,
            duration: 0.8,
            ease: "elastic.out(1, 0.3)",
            overwrite: true,
          });

          if (bgText) {
            gsap.to(bgText, {
              skewX: 0,
              scaleX: 1,
              duration: 1.2,
              ease: "elastic.out(1, 0.3)",
              overwrite: true,
            });
          }
        });

        // Clip-path image reveal animations using containerAnimation
        const galleryImages = slider.querySelectorAll(".gallery-reveal");
        galleryImages.forEach((img, i) => {
          const pattern = REVEAL_PATTERNS[i % REVEAL_PATTERNS.length];
          gsap.set(img, { clipPath: pattern.from });

          ScrollTrigger.create({
            trigger: img,
            containerAnimation: horizontalTween,
            start: "left 90%",
            onEnter: () => {
              gsap.to(img, {
                clipPath: pattern.to,
                duration: 1.2,
                ease: "power3.inOut",
              });
            },
          });
        });

        return () => {
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

      {/* Background Text — velocity-reactive */}
      <div className="hidden md:block absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <p
          ref={bgTextRef}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-heading font-bold text-forest/[0.04] select-none will-change-transform"
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
            style={{ transform: "scaleX(0)" }}
          />
        </div>
      </div>
    </section>
  );
}
