"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap, useGSAP } from "@/lib/gsap";
import { BRAND } from "@/lib/constants";

interface CompanyProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CompanyProfileModal({ isOpen, onClose }: CompanyProfileModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useGSAP(() => {
    tlRef.current = gsap.timeline({ paused: true })
      .fromTo(
        overlayRef.current,
        { clipPath: "inset(0% 0% 100% 0%)" },
        { clipPath: "inset(0% 0% 0% 0%)", duration: 0.6, ease: "power4.inOut" }
      );
  }, { scope: overlayRef });

  useEffect(() => {
    if (isOpen) {
      tlRef.current?.play();
    } else {
      tlRef.current?.reverse();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9996] flex flex-col bg-deep-green"
      style={{
        clipPath: "inset(0% 0% 100% 0%)",
        pointerEvents: isOpen ? "auto" : "none",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-stone-white/10 flex-shrink-0">
        <div>
          <span className="text-xs tracking-[0.35em] uppercase text-warm-gold font-heading">
            Eterna Builds
          </span>
          <h2 className="font-heading font-bold text-light-grey text-xl md:text-2xl tracking-[0.1em] uppercase mt-0.5">
            Company Profile
          </h2>
        </div>

        <div className="flex items-center gap-4">
          {/* Download button */}
          <a
            href="/company-profile.pdf"
            download
            className="inline-flex items-center gap-2 bg-warm-gold hover:bg-stone-white text-deep-green font-heading font-semibold text-sm tracking-wider uppercase rounded-full px-5 py-2.5 transition-colors duration-300"
            data-hover
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0">
              <path d="M8 2v8m0 0L5 7m3 3l3-3M3 13h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Download
          </a>

          {/* Close button */}
          <button
            onClick={onClose}
            className="text-light-grey/60 hover:text-light-grey transition-colors duration-200 p-1"
            data-hover
            aria-label="Close"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-hidden flex flex-col items-center justify-center">
        {/* Desktop: PDF iframe */}
        <iframe
          src="/company-profile.pdf"
          className="hidden md:block w-full h-full"
          title={`${BRAND.name} Company Profile`}
        />

        {/* Mobile: download CTA */}
        <div className="flex md:hidden flex-col items-center justify-center gap-8 px-8 text-center h-full">
          <Image
            src="/images/Logo copy.png"
            alt={BRAND.name}
            width={200}
            height={172}
            className="w-28 h-auto opacity-80"
            style={{ filter: "brightness(0) invert(1)" }}
          />
          <div>
            <p className="font-heading font-bold text-light-grey text-2xl tracking-wide mb-2">
              Company Profile
            </p>
            <p className="text-light-grey/50 text-sm leading-relaxed max-w-xs">
              Download our full company profile to explore our services, portfolio, and team.
            </p>
          </div>
          <a
            href="/company-profile.pdf"
            download
            className="inline-flex items-center gap-3 bg-warm-gold hover:bg-stone-white text-deep-green font-heading font-semibold text-base tracking-wider uppercase rounded-full px-8 py-4 transition-colors duration-300"
          >
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none" className="shrink-0">
              <path d="M8 2v8m0 0L5 7m3 3l3-3M3 13h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Download PDF
          </a>
        </div>
      </div>
    </div>
  );
}
