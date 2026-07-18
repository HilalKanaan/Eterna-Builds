"use client";

import { useRef } from "react";
import Image from "next/image";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { clamp } from "@/lib/utils";
import { splitTextToChars } from "@/lib/splitText";
import TiltCard from "@/components/ui/TiltCard";

export interface ServiceItem {
  number: string;
  title: string;
  tag: string;
  description: string;
  image?: string;
}

interface ServiceDrawerProps {
  label: string;
  title: string;
  items: ServiceItem[];
  id?: string;
  /** "dark" uses charcoal bg, "forest" uses deep-green bg */
  theme?: "dark" | "forest";
  /** Scroll in opposite direction â€” slider starts at end and moves right */
  reverse?: boolean;
}

export default function ServiceDrawer({
  label,
  title,
  items,
  id,
  theme = "dark",
  reverse = false,
}: ServiceDrawerProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const bgClass = theme === "forest" ? "bg-deep-green" : "bg-charcoal";
  const progressBg = "bg-light-grey/10";

  const cardGradient =
    theme === "forest"
      ? "from-[#1a4540]/90 to-deep-green"
      : "from-[#2a2a2a] to-charcoal";

  const overlayGradient =
    theme === "forest"
      ? "bg-gradient-to-b from-deep-green/10 via-deep-green/50 to-deep-green"
      : "bg-gradient-to-b from-charcoal/10 via-charcoal/50 to-charcoal";

  useGSAP(
    () => {
      const section = sectionRef.current;
      const slider = sliderRef.current;
      if (!section || !slider) return;

      // Character-level title reveal on scroll
      const titleEl = section.querySelector(".drawer-title");
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

      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px)", () => {
        const totalWidth = slider.scrollWidth;
        const viewportWidth = window.innerWidth;
        const scrollDistance = totalWidth - viewportWidth;

        // Reverse: start at end, animate toward 0
        if (reverse) {
          gsap.set(slider, { x: -scrollDistance, willChange: "transform" });
        } else {
          gsap.set(slider, { willChange: "transform" });
        }

        const horizontalTween = gsap.to(slider, {
          x: reverse ? 0 : -scrollDistance,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${scrollDistance}`,
            pin: true,
            scrub: 0.5,
            invalidateOnRefresh: true,
            anticipatePin: 1,
            onUpdate: (self) => {
              if (progressRef.current) {
                gsap.set(progressRef.current, { scaleX: self.progress });
              }
            },
          },
        });

        // Skew velocity effect
        const cardInners = slider.querySelectorAll(".service-card-inner");
        const skewSetter = gsap.quickSetter(cardInners, "skewX", "deg");
        let lastVelocity = 0;

        const tickerCallback = () => {
          const st = horizontalTween.scrollTrigger;
          if (!st) return;
          const velocity = st.getVelocity();
          if (Math.abs(velocity - lastVelocity) > 10) {
            lastVelocity = velocity;
            // Reverse skew direction to match movement
            skewSetter(clamp(velocity / (reverse ? 300 : -300), -5, 5));
          }
          if (Math.abs(velocity) < 5 && Math.abs(lastVelocity) > 5) {
            gsap.to(cardInners, {
              skewX: 0,
              duration: 0.6,
              ease: "power2.out",
              overwrite: true,
            });
          }
        };
        gsap.ticker.add(tickerCallback);

        // Card reveals
        const revealCards = Array.from(
          slider.querySelectorAll(".service-card-reveal")
        );

        if (reverse) {
          // Reversed: stagger from last card (immediately visible) to first
          gsap.set(revealCards, { opacity: 0, y: 50, willChange: "transform, opacity" });
          gsap.to([...revealCards].reverse(), {
            opacity: 1,
            y: 0,
            stagger: 0.12,
            duration: 1.0,
            ease: "power3.out",
            clearProps: "willChange",
            scrollTrigger: {
              trigger: section,
              start: "top 85%",
            },
          });
        } else {
          // Normal: reveal each card as it enters the viewport via containerAnimation
          revealCards.forEach((card) => {
            gsap.set(card, { opacity: 0, y: 50, willChange: "transform, opacity" });
            ScrollTrigger.create({
              trigger: card,
              containerAnimation: horizontalTween,
              start: "left 90%",
              onEnter: () => {
                gsap.to(card, {
                  opacity: 1,
                  y: 0,
                  duration: 1.0,
                  ease: "power3.out",
                  clearProps: "willChange",
                });
              },
            });
          });
        }

        return () => {
          gsap.ticker.remove(tickerCallback);
          horizontalTween.scrollTrigger?.kill();
        };
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className={`relative ${bgClass} overflow-x-hidden md:overflow-x-visible`}
      id={id}
    >
      {/* Section Header */}
      <div className="pt-24 md:pt-0 md:absolute md:top-12 md:left-12 z-20">
        <span className="text-xs tracking-[0.35em] uppercase text-sage font-heading px-6 md:px-0">
          {label}
        </span>
        <div className="overflow-hidden">
          <h2
            className="drawer-title font-heading font-bold text-light-grey mt-3 px-6 md:px-0"
            style={{
              fontSize: "clamp(2rem, 4vw, 3.5rem)",
              perspective: "400px",
            }}
          >
            {title}
          </h2>
        </div>
      </div>

      {/* Horizontal Slider (Desktop) / Vertical Cards (Mobile) */}
      <div
        ref={sliderRef}
        className="flex flex-col md:flex-row md:h-screen md:items-center gap-6 md:gap-8 px-6 md:px-16 py-8 md:py-0 md:pt-24 md:w-fit"
        data-cursor-text="Drag"
      >
        {/* Spacer for section header on desktop */}
        <div className="hidden md:block min-w-[25vw] flex-shrink-0" />

        {items.map((item, i) => (
          <div
            key={i}
            className="w-full max-w-full md:w-[40vw] lg:w-[30vw] flex-shrink-0"
            data-cursor-text="View"
          >
            <TiltCard className="service-card-inner relative overflow-hidden rounded-lg aspect-[3/4] md:aspect-[4/5]">
              <div
                className="service-card-reveal absolute inset-0"
                style={{ border: "1px solid rgba(232,224,208,0.15)" }}
              >
                {/* Background */}
                {item.image ? (
                  <>
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 40vw"
                    />
                    <div className={`absolute inset-0 ${overlayGradient}`} />
                  </>
                ) : (
                  <div className={`absolute inset-0 bg-gradient-to-br ${cardGradient}`} />
                )}

                {/* Content */}
                <div className="absolute inset-0 p-8 flex flex-col justify-between">
                  {/* Large decorative number */}
                  <span
                    className="font-heading font-bold text-stone-white/15 select-none leading-none relative z-10"
                    style={{ fontSize: "clamp(6rem, 12vw, 10rem)" }}
                  >
                    {item.number}
                  </span>

                  {/* Content block */}
                  <div className="relative z-10">
                    <span className="text-xs tracking-[0.3em] uppercase text-sage font-heading mb-3 block">
                      {item.tag}
                    </span>
                    <h3
                      className="font-heading font-bold text-light-grey leading-tight mb-3"
                      style={{ fontSize: "clamp(1.4rem, 2.2vw, 2rem)" }}
                    >
                      {item.title}
                    </h3>
                    <p className="text-light-grey/50 text-sm leading-relaxed">
                      {item.description}
                    </p>
                    <div
                      className="mt-5 h-[2px] bg-sage"
                      style={{ width: "2rem" }}
                    />
                  </div>
                </div>
              </div>
            </TiltCard>
          </div>
        ))}

        {/* End spacer */}
        <div className="hidden md:block min-w-[10vw] flex-shrink-0" />
      </div>

      {/* Progress Bar (Desktop only) */}
      <div className="hidden md:block absolute bottom-8 left-12 right-12 z-20">
        <div className={`h-[2px] ${progressBg} rounded-full overflow-hidden`}>
          <div
            ref={progressRef}
            className="h-full bg-sage origin-left"
            style={{ transform: "scaleX(0)", willChange: "transform" }}
          />
        </div>
      </div>
    </section>
  );
}
