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

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      const rotateY = ((mouseX - centerX) / (rect.width / 2)) * maxTilt;
      const rotateX = -((mouseY - centerY) / (rect.height / 2)) * maxTilt;

      gsap.to(el, {
        rotateX,
        rotateY,
        scale,
        transformPerspective: 800,
        duration: speed,
        ease: "power2.out",
        overwrite: "auto",
      });

      // Update glare position
      if (glareRef.current) {
        const xPercent = ((mouseX - rect.left) / rect.width) * 100;
        const yPercent = ((mouseY - rect.top) / rect.height) * 100;
        glareRef.current.style.background = `radial-gradient(circle at ${xPercent}% ${yPercent}%, rgba(255,255,255,0.18) 0%, transparent 60%)`;
        glareRef.current.style.opacity = "1";
      }
    };

    const handleMouseLeave = () => {
      gsap.to(el, {
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        duration: 0.8,
        ease: "elastic.out(1, 0.3)",
        overwrite: "auto",
      });

      if (glareRef.current) {
        glareRef.current.style.opacity = "0";
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
