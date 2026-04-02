"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

interface TiltConfig {
  maxTilt?: number;
  scale?: number;
  speed?: number;
}

export function useTilt(config: TiltConfig = {}) {
  const { maxTilt = 12, scale = 1.02, speed = 0.4 } = config;
  const ref = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(hover: none)").matches) return;

    // Use quickTo for GPU-efficient tween reuse on mousemove
    const rotateXTo = gsap.quickTo(el, "rotateX", { duration: speed, ease: "power2.out" });
    const rotateYTo = gsap.quickTo(el, "rotateY", { duration: speed, ease: "power2.out" });
    const scaleTo = gsap.quickTo(el, "scale", { duration: speed, ease: "power2.out" });

    gsap.set(el, { transformPerspective: 800, willChange: "transform" });

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const rotateY = ((e.clientX - centerX) / (rect.width / 2)) * maxTilt;
      const rotateX = -((e.clientY - centerY) / (rect.height / 2)) * maxTilt;

      rotateXTo(rotateX);
      rotateYTo(rotateY);
      scaleTo(scale);

      // Update glare position
      if (glareRef.current) {
        const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
        const yPercent = ((e.clientY - rect.top) / rect.height) * 100;
        gsap.set(glareRef.current, {
          background: `radial-gradient(circle at ${xPercent}% ${yPercent}%, rgba(255,255,255,0.18) 0%, transparent 60%)`,
          opacity: 1,
        });
      }
    };

    const handleMouseLeave = () => {
      rotateXTo(0);
      rotateYTo(0);
      scaleTo(1);

      if (glareRef.current) {
        gsap.set(glareRef.current, { opacity: 0 });
      }
    };

    el.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      el.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [maxTilt, scale, speed]);

  return { ref, glareRef };
}
