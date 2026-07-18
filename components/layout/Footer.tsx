"use client";

import { useRef } from "react";
import Image from "next/image";
import { gsap, useGSAP } from "@/lib/gsap";
import { BRAND } from "@/lib/constants";
import { MapPin, Facebook } from "lucide-react";
import MagneticButton from "@/components/ui/MagneticButton";
import Marquee from "@/components/ui/Marquee";
import { splitTextToChars } from "@/lib/splitText";

export default function Footer() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Character-level heading reveal
      const heading = headingRef.current;
      if (heading) {
        // Split each line's text content into chars
        const lines = heading.querySelectorAll(".footer-heading-line");
        const allChars: HTMLSpanElement[] = [];
        lines.forEach((line) => {
          const chars = splitTextToChars(line as HTMLElement);
          allChars.push(...chars);
        });

        gsap.fromTo(
          allChars,
          { yPercent: 100, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            stagger: 0.02,
            duration: 0.6,
            ease: "power4.out",
            scrollTrigger: {
              trigger: heading,
              start: "top 85%",
            },
          }
        );
      }

      // Content stagger
      const items = contentRef.current?.querySelectorAll(".footer-item");
      if (items) {
        gsap.fromTo(
          items,
          { yPercent: 30, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            stagger: 0.1,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: contentRef.current,
              start: "top 85%",
            },
          }
        );
      }
    },
    { scope: sectionRef }
  );

  return (
    <footer
      ref={sectionRef}
      className="relative bg-charcoal text-beige overflow-hidden"
      id="contact"
    >
      {/* Marquee Background */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-center gap-4 opacity-[0.03]">
        <Marquee
          text="Eterna Builds"
          speed={25}
          className="font-heading text-6xl md:text-8xl font-bold"
        />
        <Marquee
          text="Eterna Builds"
          speed={30}
          reverse
          className="font-heading text-6xl md:text-8xl font-bold"
        />
        <Marquee
          text="Eterna Builds"
          speed={22}
          className="font-heading text-6xl md:text-8xl font-bold"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-24 md:py-40">
        {/* CTA Section */}
        <div className="text-center mb-20 md:mb-32">
          <h2
            ref={headingRef}
            className="font-heading font-bold leading-[1.1] mb-10"
            style={{ fontSize: "clamp(1.75rem, 6vw, 5rem)", perspective: "400px" }}
          >
            <span className="footer-heading-line block overflow-hidden">Let&apos;s Build Something</span>
            <span className="footer-heading-line block overflow-hidden italic text-clay">Timeless</span>
          </h2>
          <div data-cursor-text="Click">
            <MagneticButton>Start Your Project</MagneticButton>
          </div>
        </div>

        {/* Contact Info */}
        <div ref={contentRef}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
            {/* Lebanon */}
            <div className="footer-item">
              <div className="flex items-center gap-3 mb-3">
                <MapPin className="w-4 h-4 text-clay" />
                <span className="text-xs tracking-[0.3em] uppercase font-heading text-beige/50">
                  {BRAND.contact.lebanon.label}
                </span>
              </div>
              <a
                href={`tel:${BRAND.contact.lebanon.phone.replace(/\s/g, "")}`}
                className="text-2xl md:text-3xl font-heading font-light text-beige hover:text-clay transition-colors duration-300"
                data-hover
              >
                {BRAND.contact.lebanon.phone}
              </a>
            </div>

            {/* Saudi Arabia */}
            <div className="footer-item">
              <div className="flex items-center gap-3 mb-3">
                <MapPin className="w-4 h-4 text-clay" />
                <span className="text-xs tracking-[0.3em] uppercase font-heading text-beige/50">
                  {BRAND.contact.saudi.label}
                </span>
              </div>
              <a
                href={`tel:${BRAND.contact.saudi.phone.replace(/\s/g, "")}`}
                className="text-2xl md:text-3xl font-heading font-light text-beige hover:text-clay transition-colors duration-300"
                data-hover
              >
                {BRAND.contact.saudi.phone}
              </a>
            </div>
          </div>

          {/* Divider */}
          <hr className="footer-item border-beige/10 mb-8" />

          {/* Bottom Row */}
          <div className="footer-item flex flex-col md:flex-row items-center justify-between gap-6">
            <Image
              src="/images/logo.svg"
              alt={BRAND.name}
              width={160}
              height={80}
              className="h-14 w-auto"
              style={{ filter: "brightness(0) invert(1)" }}
            />

            <a
              href={BRAND.contact.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-beige/50 hover:text-clay transition-colors duration-300 text-sm"
              data-hover
            >
              <Facebook className="w-4 h-4" />
              <span className="font-heading tracking-wider">
                Eterna Builds
              </span>
            </a>

            <span className="text-beige/30 text-xs tracking-wider">
              &copy; {new Date().getFullYear()} Eterna Builds. All rights
              reserved.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
