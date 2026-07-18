"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { BRAND } from "@/lib/constants";

const NAV_LINKS = [
  { label: "About", href: "#about" },
  { label: "Work", href: "#work" },
  { label: "Contact", href: "#contact" },
];

interface NavbarProps {
  onOpenProfile: () => void;
}

export default function Navbar({ onOpenProfile }: NavbarProps) {
  const navRef = useRef<HTMLElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useGSAP(() => {
    // Change navbar bg on scroll past hero
    ScrollTrigger.create({
      trigger: "#about",
      start: "top 80%",
      onEnter: () => {
        gsap.to(navRef.current, {
          backgroundColor: "rgba(20, 53, 49, 0.92)",
          backdropFilter: "blur(12px)",
          duration: 0.4,
        });
      },
      onLeaveBack: () => {
        gsap.to(navRef.current, {
          backgroundColor: "rgba(20, 53, 49, 0)",
          backdropFilter: "blur(0px)",
          duration: 0.4,
        });
      },
    });

    // Menu animation timeline
    tlRef.current = gsap.timeline({ paused: true });
    tlRef.current
      .to(menuRef.current, {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 0.6,
        ease: "power4.inOut",
      })
      .fromTo(
        ".menu-link",
        { yPercent: 100, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          stagger: 0.08,
          duration: 0.6,
          ease: "power3.out",
        },
        "-=0.2"
      );
  });

  const toggleMenu = () => {
    if (menuOpen) {
      tlRef.current?.reverse();
    } else {
      tlRef.current?.play();
    }
    setMenuOpen(!menuOpen);
  };

  const handleNavClick = (href: string) => {
    if (menuOpen) {
      tlRef.current?.reverse();
      setMenuOpen(false);
    }
    const target = document.querySelector(href);
    target?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <nav
        ref={navRef}
        className="fixed top-0 left-0 right-0 z-50 transition-colors"
        style={{ backgroundColor: "rgba(20, 53, 49, 0)", willChange: "backdrop-filter, background-color" }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 md:px-12 py-5">
          {/* Logo */}
          <a
            href="#home"
            className="flex items-center gap-3"
            data-hover
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            <Image
              src="/images/Logo copy.png"
              alt={BRAND.name}
              width={373}
              height={321}
              className="h-[3.9rem] w-auto md:h-[4.74rem]"
              style={{ filter: "brightness(0) invert(1)" }}
            />
          </a>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-10">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-light-grey/70 hover:text-sage text-base font-medium tracking-[0.15em] uppercase font-heading transition-colors duration-300"
                data-hover
                data-cursor-text="Explore"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link.href);
                }}
              >
                {link.label}
              </a>
            ))}

            {/* Download Company Profile CTA */}
            <a
              href="#"
              className="inline-flex items-center gap-2 bg-sage hover:bg-deep-green text-light-grey font-heading font-semibold text-sm tracking-wider uppercase rounded-full px-5 py-2.5 transition-colors duration-300"
              data-hover
              data-cursor-text="View"
              onClick={(e) => { e.preventDefault(); onOpenProfile(); }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                <path d="M8 2v8m0 0L5 7m3 3l3-3M3 13h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Company Profile
            </a>
          </div>

          {/* Hamburger */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-2"
            onClick={toggleMenu}
            data-hover
            aria-label="Toggle menu"
          >
            <span
              className={`block w-6 h-[2px] bg-light-grey transition-transform duration-300 ${
                menuOpen ? "rotate-45 translate-y-[5px]" : ""
              }`}
            />
            <span
              className={`block w-6 h-[2px] bg-light-grey transition-opacity duration-300 ${
                menuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block w-6 h-[2px] bg-light-grey transition-transform duration-300 ${
                menuOpen ? "-rotate-45 -translate-y-[5px]" : ""
              }`}
            />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        ref={menuRef}
        className="fixed inset-0 z-40 bg-deep-green flex flex-col items-center justify-center gap-8"
        style={{ clipPath: "inset(0% 0% 100% 0%)" }}
      >
        {NAV_LINKS.map((link) => (
          <div key={link.href} className="overflow-hidden">
            <a
              href={link.href}
              className="menu-link block font-heading font-semibold text-light-grey text-5xl tracking-[0.15em] uppercase hover:text-sage transition-colors"
              data-hover
              onClick={(e) => {
                e.preventDefault();
                handleNavClick(link.href);
              }}
            >
              {link.label}
            </a>
          </div>
        ))}

        {/* Download Company Profile CTA */}
        <div className="overflow-hidden mt-4">
          <a
            href="#"
            className="menu-link inline-flex items-center gap-3 bg-sage hover:bg-deep-green text-light-grey font-heading font-semibold text-lg tracking-wider uppercase rounded-full px-8 py-3.5 transition-colors duration-300"
            data-hover
            onClick={(e) => { e.preventDefault(); tlRef.current?.reverse(); setMenuOpen(false); onOpenProfile(); }}
          >
            <svg width="20" height="20" viewBox="0 0 16 16" fill="none" className="shrink-0">
              <path d="M8 2v8m0 0L5 7m3 3l3-3M3 13h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Company Profile
          </a>
        </div>
      </div>
    </>
  );
}
