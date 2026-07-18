"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

interface MarqueeProps {
  text?: string;
  speed?: number;
  className?: string;
  reverse?: boolean;
}

export default function Marquee({
  text = "Eterna Builds",
  speed = 20,
  className = "",
  reverse = false,
}: MarqueeProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!trackRef.current) return;

    gsap.fromTo(
      trackRef.current,
      { xPercent: reverse ? -50 : 0 },
      {
        xPercent: reverse ? 0 : -50,
        duration: speed,
        ease: "none",
        repeat: -1,
      }
    );
  });

  const separator = (
    <span className="mx-8 inline-block text-amber opacity-60">&mdash;</span>
  );

  const items = Array.from({ length: 10 }, (_, i) => (
    <span key={i} className="inline-flex items-center whitespace-nowrap">
      <span>{text}</span>
      {separator}
    </span>
  ));

  return (
    <div className={`overflow-hidden ${className}`}>
      <div
        ref={trackRef}
        className="flex whitespace-nowrap will-change-transform"
      >
        {items}
        {items}
      </div>
    </div>
  );
}
