"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { gsap, useGSAP } from "@/lib/gsap";
import { BRAND } from "@/lib/constants";
import { Facebook, Instagram, Linkedin } from "lucide-react";
import Marquee from "@/components/ui/Marquee";

const COUNTRIES = [
  { id: "lebanon", label: "Lebanon", flag: "ðŸ‡±ðŸ‡§" },
  { id: "ksa", label: "Saudi Arabia", flag: "ðŸ‡¸ðŸ‡¦" },
];

const PROJECT_TYPES = [
  { id: "commercial", label: "Commercial" },
  { id: "private", label: "Private" },
  { id: "organizational", label: "Organizational" },
];

const SERVICES = [
  { id: "design", label: "Design" },
  { id: "pm", label: "PM & Consultancy" },
  { id: "supervision", label: "Supervision" },
  { id: "execution", label: "Execution & Contracting" },
];

interface FormState {
  name: string;
  email: string;
  phone: string;
  country: string;
  projectType: string;
  services: string[];
}

export default function Footer() {
  const sectionRef = useRef<HTMLElement>(null);

  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    country: "",
    projectType: "",
    services: [],
  });

  const [focused, setFocused] = useState<string | null>(null);

  type SubmitStatus = "idle" | "loading" | "success" | "error";
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.phone.trim() ||
      !form.country ||
      !form.projectType ||
      form.services.length === 0
    ) {
      setErrorMessage("Please fill in all fields and select at least one service.");
      setSubmitStatus("error");
      return;
    }

    setSubmitStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const json = await res.json();

      if (!res.ok) {
        setErrorMessage(json.error ?? "Something went wrong. Please try again.");
        setSubmitStatus("error");
        return;
      }

      setSubmitStatus("success");
      setForm({ name: "", email: "", phone: "", country: "", projectType: "", services: [] });
    } catch {
      setErrorMessage("Network error. Please check your connection and try again.");
      setSubmitStatus("error");
    }
  };

  const toggleService = (id: string) => {
    setForm((prev) => ({
      ...prev,
      services: prev.services.includes(id)
        ? prev.services.filter((s) => s !== id)
        : [...prev.services, id],
    }));
  };

  useGSAP(
    () => {
      gsap.fromTo(
        ".footer-row",
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.1,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 85%",
          },
        }
      );
    },
    { scope: sectionRef }
  );

  /* â”€â”€ Styling helpers â”€â”€ */
  const inputBase =
    "w-full bg-transparent border-b border-light-grey/15 pb-2.5 pt-0.5 text-sm text-light-grey placeholder-light-grey/25 font-body outline-none transition-colors duration-300 focus:border-warm-gold";

  const pillBase =
    "px-3.5 py-1.5 rounded-full border text-xs font-heading font-medium tracking-wide transition-all duration-300 cursor-pointer select-none whitespace-nowrap";

  const pillInactive =
    "border-light-grey/20 text-light-grey/50 hover:border-warm-gold/50 hover:text-light-grey";

  const pillActive = "bg-warm-gold border-warm-gold text-light-grey";

  return (
    <footer
      ref={sectionRef}
      className="relative bg-deep-green text-light-grey overflow-hidden"
      id="contact"
    >
      {/* Moving marquee watermark */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-center gap-4 opacity-[0.035]">
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

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-16 pb-8 md:pt-20 md:pb-10">

        {/* â”€â”€ Form header â”€â”€ */}
        <div className="footer-row flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-10">
          <div>
            <span className="text-[10px] tracking-[0.35em] uppercase text-warm-gold font-heading block mb-2">
              Contact Us
            </span>
            <h2
              className="font-heading font-bold text-light-grey leading-tight"
              style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.8rem)" }}
            >
              Start Your{" "}
              <span className="italic text-warm-gold">Project</span>
            </h2>
          </div>
          <p className="text-light-grey/40 text-sm max-w-xs text-right hidden sm:block">
            Share your vision â€” we&apos;ll get back to you shortly.
          </p>
        </div>

        {/* â”€â”€ Phone numbers â”€â”€ */}
        <div className="footer-row flex flex-wrap gap-x-10 gap-y-3 mb-10">
          <div>
            <p className="text-[9px] tracking-[0.3em] uppercase text-warm-gold font-heading mb-1">
              Lebanon
            </p>
            <a
              href={`tel:${BRAND.contact.lebanon.phone.replace(/\s/g, "")}`}
              className="text-light-grey/50 hover:text-light-grey text-sm font-light transition-colors duration-300"
              data-hover
            >
              {BRAND.contact.lebanon.phone}
            </a>
          </div>
          <div>
            <p className="text-[9px] tracking-[0.3em] uppercase text-warm-gold font-heading mb-1">
              Saudi Arabia
            </p>
            <a
              href={`tel:${BRAND.contact.saudi.phone.replace(/\s/g, "")}`}
              className="text-light-grey/50 hover:text-light-grey text-sm font-light transition-colors duration-300"
              data-hover
            >
              {BRAND.contact.saudi.phone}
            </a>
          </div>
        </div>

        {/* â”€â”€ Form â”€â”€ */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-6"
        >
          {/* Row 1 â€” Name / Email / Phone */}
          <div className="footer-row grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-6">
            <div>
              <label className="text-[9px] tracking-[0.3em] uppercase font-heading text-light-grey/35 block mb-2">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Your name"
                autoComplete="name"
                className={inputBase}
                style={focused === "name" ? {} : {}}
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                onFocus={() => setFocused("name")}
                onBlur={() => setFocused(null)}
              />
            </div>
            <div>
              <label className="text-[9px] tracking-[0.3em] uppercase font-heading text-light-grey/35 block mb-2">
                Email Address
              </label>
              <input
                type="email"
                placeholder="your@email.com"
                autoComplete="email"
                className={inputBase}
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused(null)}
              />
            </div>
            <div>
              <label className="text-[9px] tracking-[0.3em] uppercase font-heading text-light-grey/35 block mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="+961 / +966"
                autoComplete="tel"
                className={inputBase}
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                onFocus={() => setFocused("phone")}
                onBlur={() => setFocused(null)}
              />
            </div>
          </div>

          {/* Row 2 â€” Country + Project Type */}
          <div className="footer-row grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
            <div>
              <label className="text-[9px] tracking-[0.3em] uppercase font-heading text-light-grey/35 block mb-3">
                Country
              </label>
              <div className="flex flex-wrap gap-2">
                {COUNTRIES.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, country: c.id }))}
                    className={`${pillBase} ${form.country === c.id ? pillActive : pillInactive}`}
                  >
                    <span className="mr-1">{c.flag}</span>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[9px] tracking-[0.3em] uppercase font-heading text-light-grey/35 block mb-3">
                Type of Project
              </label>
              <div className="flex flex-wrap gap-2">
                {PROJECT_TYPES.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, projectType: type.id }))}
                    className={`${pillBase} ${form.projectType === type.id ? pillActive : pillInactive}`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Row 3 â€” Services multi-select */}
          <div className="footer-row">
            <label className="text-[9px] tracking-[0.3em] uppercase font-heading text-light-grey/35 block mb-3">
              Services Required{" "}
              <span className="text-light-grey/20 normal-case tracking-normal font-body">
                â€” select all that apply
              </span>
            </label>
            <div className="flex flex-wrap gap-2">
              {SERVICES.map((service) => {
                const active = form.services.includes(service.id);
                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => toggleService(service.id)}
                    className={`${pillBase} ${active ? pillActive : pillInactive}`}
                  >
                    {active && (
                      <span className="mr-1 text-[9px] font-bold">âœ“</span>
                    )}
                    {service.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 4 â€” Submit */}
          <div className="footer-row flex items-center justify-end gap-4 pt-1">
            {submitStatus === "success" && (
              <p className="text-sm font-body text-warm-gold tracking-wide">
                Enquiry sent â€” check your email for a confirmation.
              </p>
            )}
            {submitStatus === "error" && (
              <p className="text-sm font-body text-red-400 tracking-wide">
                {errorMessage}
              </p>
            )}
            <button
              type="submit"
              disabled={submitStatus === "loading" || submitStatus === "success"}
              className="group inline-flex items-center gap-2.5 px-8 py-3 bg-warm-gold hover:bg-deep-green text-light-grey font-heading font-semibold text-xs tracking-[0.2em] uppercase rounded-full transition-all duration-300 border border-warm-gold hover:border-light-grey/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-warm-gold disabled:hover:border-warm-gold"
              data-hover
              data-cursor-text="Send"
            >
              {submitStatus === "loading" ? "Sending..." : "Send Enquiry"}
              {submitStatus !== "loading" && (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="transition-transform duration-300 group-hover:translate-x-1"
                >
                  <path
                    d="M3 8h10M9 4l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          </div>
        </form>

        {/* â”€â”€ Divider â”€â”€ */}
        <hr className="border-light-grey/8 my-10" />

        {/* â”€â”€ Bottom bar â”€â”€ */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
          <Image
            src="/images/Logo copy.png"
            alt={BRAND.name}
            width={373}
            height={321}
            className="h-8 w-auto"
            style={{ filter: "brightness(0) invert(1)" }}
          />
          <div className="flex items-center gap-5">
            <a
              href={BRAND.contact.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="text-light-grey/40 hover:text-warm-gold transition-colors duration-300"
              data-hover
              aria-label="Facebook"
            >
              <Facebook className="w-4 h-4" />
            </a>
            <a
              href={BRAND.contact.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-light-grey/40 hover:text-warm-gold transition-colors duration-300"
              data-hover
              aria-label="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href={BRAND.contact.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-light-grey/40 hover:text-warm-gold transition-colors duration-300"
              data-hover
              aria-label="LinkedIn"
            >
              <Linkedin className="w-4 h-4" />
            </a>
          </div>
          <span className="text-light-grey/25 text-xs tracking-wider">
            &copy; {new Date().getFullYear()} Eterna Builds. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}
