"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { splitTextToChars } from "@/lib/splitText";

const OVERLAY_PHASES = [
  { label: "Foundation", progress: [0.0, 0.25] },
  { label: "Structure", progress: [0.25, 0.5] },
  { label: "Interior", progress: [0.5, 0.75] },
  { label: "Finishing Touch", progress: [0.75, 1.0] },
];

export default function RoomAssembly() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const progressNumberRef = useRef<HTMLSpanElement>(null);
  const overlayRefs = useRef<(HTMLDivElement | null)[]>([]);
  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      // Character-level title reveal
      const titleEl = section.querySelector(".process-title");
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
        const video = videoRef.current;
        if (!video) return;

        ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: "+=2500",
          pin: true,
          scrub: 0.5,
          anticipatePin: 1,
          onUpdate: (self) => {
            // Map scroll progress to video time (safe even before metadata loads)
            const duration = video.duration;
            if (duration && !isNaN(duration)) {
              video.currentTime = self.progress * duration;
            }

            // Update progress bar
            if (progressRef.current) {
              gsap.set(progressRef.current, { scaleX: self.progress });
            }

            // Update percentage
            if (progressNumberRef.current) {
              progressNumberRef.current.textContent = `${Math.round(self.progress * 100)}%`;
            }

            // Animate text overlay phases
            OVERLAY_PHASES.forEach((phase, i) => {
              const el = overlayRefs.current[i];
              if (!el) return;

              const [start, end] = phase.progress;
              const fadeIn = start + 0.05;
              const fadeOut = end - 0.05;

              if (self.progress >= start && self.progress <= end) {
                let opacity = 1;
                if (self.progress < fadeIn) {
                  opacity = (self.progress - start) / 0.05;
                } else if (self.progress > fadeOut) {
                  opacity = (end - self.progress) / 0.05;
                }
                gsap.set(el, { opacity, yPercent: (1 - opacity) * 10 });
              } else {
                gsap.set(el, { opacity: 0, yPercent: 10 });
              }
            });
          },
        });
      });

      mm.add("(max-width: 767px)", () => {
        const video = videoRef.current;
        if (!video) return;

        // Mobile: autoplay on scroll into view
        ScrollTrigger.create({
          trigger: section,
          start: "top 80%",
          end: "bottom 20%",
          onEnter: () => video.play(),
          onLeave: () => video.pause(),
          onEnterBack: () => video.play(),
          onLeaveBack: () => video.pause(),
        });
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="relative bg-deep-green overflow-hidden"
      id="process"
    >
      {/* Section Header */}
      <div className="pt-24 pb-8 md:pb-0 md:absolute md:top-12 md:left-12 z-20">
        <span className="text-xs tracking-[0.35em] uppercase text-minted-grey font-heading px-6 md:px-0">
          Our Process
        </span>
        <div className="overflow-hidden">
          <h2
            className="process-title font-heading font-bold text-light-grey mt-3 px-6 md:px-0"
            style={{
              fontSize: "clamp(2rem, 4vw, 3.5rem)",
              perspective: "400px",
            }}
          >
            Watch It Come Together
          </h2>
        </div>
      </div>

      {/* Video Container */}
      <div className="relative w-full aspect-video md:h-screen md:aspect-auto">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          src="/videos/room-assembly.mp4"
          muted
          playsInline
          preload="auto"
          onLoadedMetadata={() => ScrollTrigger.refresh()}
        />

        {/* Gradient overlays for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-deep-green/60 via-transparent to-deep-green/70 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-deep-green/40 via-transparent to-transparent pointer-events-none" />

        {/* Phase Text Overlays */}
        <div className="hidden md:block absolute bottom-24 left-12 z-10">
          {OVERLAY_PHASES.map((phase, i) => (
            <div
              key={phase.label}
              ref={(el) => {
                overlayRefs.current[i] = el;
              }}
              className="absolute bottom-0 left-0"
              style={{ opacity: 0, willChange: "transform, opacity" }}
            >
              <span className="text-xs tracking-[0.35em] uppercase text-minted-grey font-heading block mb-2">
                Step {i + 1} of {OVERLAY_PHASES.length}
              </span>
              <span
                className="font-heading font-bold text-light-grey block"
                style={{ fontSize: "clamp(1.5rem, 3vw, 2.5rem)" }}
              >
                {phase.label}
              </span>
            </div>
          ))}
        </div>

        {/* Progress Indicator (bottom right) */}
        <div className="hidden md:flex absolute bottom-24 right-12 z-10 items-center gap-4">
          <span
            ref={progressNumberRef}
            className="font-heading text-light-grey/60 text-sm tracking-widest"
          >
            0%
          </span>
          <div className="w-24 h-[2px] bg-light-grey/10 rounded-full overflow-hidden">
            <div
              ref={progressRef}
              className="h-full bg-minted-grey origin-left"
              style={{ transform: "scaleX(0)", willChange: "transform" }}
            />
          </div>
        </div>

        {/* Background Decorative Text */}
        <div className="hidden md:block absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <p
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-heading font-bold text-light-grey/[0.03] select-none"
            style={{ fontSize: "clamp(8rem, 18vw, 20rem)" }}
          >
            Built to Last
          </p>
        </div>
      </div>
    </section>
  );
}
