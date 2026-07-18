"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { gsap, useGSAP } from "@/lib/gsap";
import { splitTextToChars } from "@/lib/splitText";

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLDivElement>(null);

  // Hover preview state
  const [hoverPreview, setHoverPreview] = useState<{
    visible: boolean;
    image: string;
    x: number;
    y: number;
  }>({ visible: false, image: "", x: 0, y: 0 });

  useGSAP(
    () => {
      const section = sectionRef.current;
      const heading = headingRef.current;
      if (!section || !heading) return;

      // Character-level opacity reveal on scroll
      const words = heading.querySelectorAll(".about-word");
      const allChars: HTMLSpanElement[] = [];
      words.forEach((word) => {
        const chars = splitTextToChars(word as HTMLElement);
        allChars.push(...chars);
      });

      gsap.fromTo(
        allChars,
        { opacity: 0.1 },
        {
          opacity: 1,
          stagger: 0.02,
          scrollTrigger: {
            trigger: heading,
            start: "top 80%",
            end: "top 20%",
            scrub: 1,
          },
        }
      );

      // Stats counter animation
      const statNumbers = statsRef.current?.querySelectorAll(".stat-number");
      statNumbers?.forEach((el) => {
        const target = parseInt(el.getAttribute("data-value") || "0");
        const obj = { val: 0 };
        gsap.to(obj, {
          val: target,
          duration: 2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
          },
          onUpdate: () => {
            (el as HTMLElement).textContent = String(Math.round(obj.val));
          },
        });
      });

      // Description fade in
      gsap.fromTo(
        descRef.current?.querySelectorAll(".desc-col") || [],
        { yPercent: 30, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          stagger: 0.2,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: descRef.current,
            start: "top 80%",
          },
        }
      );
    },
    { scope: sectionRef }
  );

  const handleKeywordHover = (
    e: React.MouseEvent,
    image: string,
    show: boolean
  ) => {
    if (show) {
      setHoverPreview({ visible: true, image, x: e.clientX, y: e.clientY });
    } else {
      setHoverPreview((prev) => ({ ...prev, visible: false }));
    }
  };

  const handleKeywordMouseMove = (e: React.MouseEvent) => {
    if (hoverPreview.visible) {
      setHoverPreview((prev) => ({ ...prev, x: e.clientX, y: e.clientY }));
    }
  };

  const headingText =
    "Driving bold construction projects to timeless spaces for modern living.";

  const renderWord = (word: string, index: number) => {
    if (word === "bold") {
      return (
        <span
          key={index}
          className="about-word inline-block mr-[0.3em] italic text-clay cursor-pointer"
          data-hover
          onMouseEnter={(e) =>
            handleKeywordHover(e, "/images/bold-preview.jpg", true)
          }
          onMouseLeave={(e) =>
            handleKeywordHover(e, "/images/bold-preview.jpg", false)
          }
          onMouseMove={handleKeywordMouseMove}
        >
          {word}
        </span>
      );
    }
    if (word === "timeless") {
      return (
        <span
          key={index}
          className="about-word inline-block mr-[0.3em] italic text-clay cursor-pointer"
          data-hover
          onMouseEnter={(e) =>
            handleKeywordHover(e, "/images/timeless-preview.jpg", true)
          }
          onMouseLeave={(e) =>
            handleKeywordHover(e, "/images/timeless-preview.jpg", false)
          }
          onMouseMove={handleKeywordMouseMove}
        >
          {word}
        </span>
      );
    }
    return (
      <span key={index} className="about-word inline-block mr-[0.3em]">
        {word}
      </span>
    );
  };

  const stats = [
    { value: 150, suffix: "+", label: "Projects Delivered" },
    { value: 2, suffix: "", label: "Countries" },
    { value: 12, suffix: "+", label: "Years of Excellence" },
    { value: 40, suffix: "+", label: "Design Awards" },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative z-10 bg-forest text-beige"
      id="about"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-24 md:py-40">
        {/* Section Label */}
        <span className="inline-block text-xs tracking-[0.35em] uppercase text-clay mb-12 font-heading">
          Our Philosophy
        </span>

        {/* Main Heading with word-by-word reveal */}
        <h2
          ref={headingRef}
          className="font-heading font-bold leading-[1.1] mb-12 md:mb-20"
          style={{ fontSize: "clamp(2rem, 5vw, 4.5rem)" }}
        >
          {headingText.split(" ").map(renderWord)}
        </h2>

        {/* Two-column description */}
        <div
          ref={descRef}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 mb-12 md:mb-20"
        >
          <p className="desc-col text-beige/70 text-lg leading-relaxed">
            At Eterna Builds, we believe that spaces should resonate with the
            people who inhabit them. Our design philosophy merges architectural
            precision with an intimate understanding of how people live, work,
            and feel within their environments.
          </p>
          <p className="desc-col text-beige/70 text-lg leading-relaxed">
            With roots in Lebanon and a growing presence in Saudi Arabia, we
            bring a unique Mediterranean sensibility to the Middle East&apos;s
            most ambitious residential and commercial projects.
          </p>
        </div>

        {/* Stats */}
        <div
          ref={statsRef}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 border-t border-beige/10"
        >
          {stats.map((stat, i) => (
            <div key={i}>
              <div className="font-heading text-clay mb-2" style={{ fontSize: "clamp(2.5rem, 4vw, 3.5rem)" }}>
                <span className="stat-number" data-value={stat.value}>
                  0
                </span>
                {stat.suffix}
              </div>
              <span className="text-beige/50 text-sm tracking-wider uppercase">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Hover Preview Image */}
      {hoverPreview.visible && (
        <div
          className="fixed pointer-events-none z-50 transition-opacity duration-300"
          style={{
            left: hoverPreview.x + 20,
            top: hoverPreview.y - 100,
            opacity: hoverPreview.visible ? 1 : 0,
          }}
        >
          <div className="w-64 h-44 overflow-hidden rounded-lg shadow-2xl">
            <Image
              src={hoverPreview.image}
              alt="Preview"
              width={256}
              height={176}
              className="object-cover w-full h-full"
            />
          </div>
        </div>
      )}
    </section>
  );
}
