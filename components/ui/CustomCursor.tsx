"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

const DEFAULT_SIZE = 40;
const EXPANDED_SIZE = 90;

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const isTouch = useRef(false);
  const isExpanded = useRef(false);
  const rotationTween = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    // Detect touch devices
    if (window.matchMedia("(hover: none)").matches) {
      isTouch.current = true;
      return;
    }

    const cursor = cursorRef.current;
    const dot = dotRef.current;
    const text = textRef.current;
    if (!cursor || !dot || !text) return;

    // Current size tracking for offset calculation
    let currentSize = DEFAULT_SIZE;

    const xTo = gsap.quickTo(cursor, "x", {
      duration: 0.45,
      ease: "power3",
    });
    const yTo = gsap.quickTo(cursor, "y", {
      duration: 0.45,
      ease: "power3",
    });
    const dotXTo = gsap.quickTo(dot, "x", {
      duration: 0.01,
      ease: "none",
    });
    const dotYTo = gsap.quickTo(dot, "y", {
      duration: 0.01,
      ease: "none",
    });

    const handleMouseMove = (e: MouseEvent) => {
      const offset = currentSize / 2;
      xTo(e.clientX - offset);
      yTo(e.clientY - offset);
      dotXTo(e.clientX - 4);
      dotYTo(e.clientY - 4);
    };

    const expandCursor = (label: string) => {
      if (isExpanded.current) return;
      isExpanded.current = true;
      currentSize = EXPANDED_SIZE;

      text.textContent = label;

      gsap.to(cursor, {
        width: EXPANDED_SIZE,
        height: EXPANDED_SIZE,
        borderColor: "#C4A35A",
        duration: 0.4,
        ease: "power3.out",
        overwrite: "auto",
      });

      gsap.to(text, {
        opacity: 1,
        scale: 1,
        duration: 0.3,
        ease: "power2.out",
        delay: 0.1,
      });

      gsap.to(dot, {
        opacity: 0,
        scale: 0,
        duration: 0.2,
        overwrite: "auto",
      });

      // Slow rotation
      rotationTween.current = gsap.to(cursor, {
        rotation: "+=360",
        duration: 8,
        repeat: -1,
        ease: "none",
      });
    };

    const contractCursor = () => {
      if (!isExpanded.current) return;
      isExpanded.current = false;
      currentSize = DEFAULT_SIZE;

      rotationTween.current?.kill();
      rotationTween.current = null;

      gsap.to(cursor, {
        width: DEFAULT_SIZE,
        height: DEFAULT_SIZE,
        borderColor: "#f7f9f9",
        rotation: 0,
        duration: 0.4,
        ease: "power3.out",
        overwrite: "auto",
      });

      gsap.to(text, {
        opacity: 0,
        scale: 0.5,
        duration: 0.2,
        ease: "power2.in",
      });

      gsap.to(dot, {
        opacity: 1,
        scale: 1,
        duration: 0.3,
        delay: 0.1,
        overwrite: "auto",
      });
    };

    const handleMouseOver = (e: Event) => {
      const target = e.target as HTMLElement;

      // Check for context-aware cursor text
      const cursorTextEl = target.closest("[data-cursor-text]");
      if (cursorTextEl) {
        const label = cursorTextEl.getAttribute("data-cursor-text") || "";
        expandCursor(label);
        return;
      }

      // Standard hover scale for links/buttons
      if (
        target.tagName === "A" ||
        target.tagName === "BUTTON" ||
        target.closest("a") ||
        target.closest("button") ||
        target.hasAttribute("data-hover")
      ) {
        gsap.to(cursor, {
          scale: 1.8,
          borderColor: "#C4A35A",
          duration: 0.4,
          ease: "power2.out",
          overwrite: "auto",
        });
      }
    };

    const handleMouseOut = (e: Event) => {
      const target = e.target as HTMLElement;
      const related = (e as MouseEvent).relatedTarget as HTMLElement | null;

      // Check if we're leaving a data-cursor-text element
      const cursorTextEl = target.closest("[data-cursor-text]");
      if (cursorTextEl) {
        // Only contract if we're not entering another cursor-text element
        const newCursorTextEl = related?.closest("[data-cursor-text]");
        if (!newCursorTextEl) {
          contractCursor();
        } else {
          // Switching between cursor-text elements — update label
          const newLabel = newCursorTextEl.getAttribute("data-cursor-text") || "";
          if (text.textContent !== newLabel) {
            text.textContent = newLabel;
          }
        }
        return;
      }

      // Standard hover reset
      if (
        target.tagName === "A" ||
        target.tagName === "BUTTON" ||
        target.closest("a") ||
        target.closest("button") ||
        target.hasAttribute("data-hover")
      ) {
        if (!isExpanded.current) {
          gsap.to(cursor, {
            scale: 1,
            borderColor: "#f7f9f9",
            duration: 0.4,
            ease: "power2.out",
            overwrite: "auto",
          });
        }
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseout", handleMouseOut);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
      rotationTween.current?.kill();
    };
  }, []);

  return (
    <>
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 z-[9999] pointer-events-none hidden md:flex items-center justify-center"
        style={{
          width: DEFAULT_SIZE,
          height: DEFAULT_SIZE,
          borderRadius: "50%",
          border: "2px solid #f7f9f9",
          mixBlendMode: "difference",
          willChange: "transform",
        }}
      >
        {/* Context label */}
        <span
          ref={textRef}
          className="font-heading text-[10px] tracking-[0.15em] uppercase text-light-grey select-none"
          style={{
            opacity: 0,
            transform: "scale(0.5)",
            whiteSpace: "nowrap",
          }}
        >
          View
        </span>
      </div>
      <div
        ref={dotRef}
        className="fixed top-0 left-0 z-[9999] pointer-events-none hidden md:block"
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          backgroundColor: "#f7f9f9",
          mixBlendMode: "difference",
          willChange: "transform",
        }}
      />
    </>
  );
}
