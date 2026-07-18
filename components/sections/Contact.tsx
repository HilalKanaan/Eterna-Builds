"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { splitTextToChars } from "@/lib/splitText";
import { BRAND } from "@/lib/constants";

const COUNTRIES = [
  { id: "lebanon", label: "Lebanon", flag: "🇱🇧" },
  { id: "ksa", label: "Saudi Arabia", flag: "🇸🇦" },
];

const PROJECT_TYPES = [
  { id: "commercial", label: "Commercial Project" },
  { id: "private", label: "Private Project" },
  { id: "organizational", label: "Organizational Project" },
];

const SERVICES = [
  { id: "design", label: "Design" },
  { id: "pm", label: "Project Management & Consultancy" },
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

export default function Contact() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

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
      const heading = headingRef.current;
      if (!heading) return;

      // Character-level heading reveal
      const lines = heading.querySelectorAll(".contact-line");
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
          duration: 0.7,
          ease: "power4.out",
          scrollTrigger: { trigger: heading, start: "top 85%" },
        }
      );

      // Left column slide in
      gsap.fromTo(
        ".contact-left",
        { x: -28, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          stagger: 0.1,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 78%" },
        }
      );

      // Form fields stagger in
      gsap.fromTo(
        ".contact-field",
        { y: 32, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.08,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 68%" },
        }
      );
    },
    { scope: sectionRef }
  );

  /* â”€â”€ Styling helpers â”€â”€ */
  const inputBase =
    "w-full bg-transparent border-b pb-3 pt-1 font-body text-base outline-none transition-colors duration-300 text-charcoal placeholder-charcoal/25";

  const inputBorder = (field: string) =>
    focused === field ? "border-deep-green" : "border-charcoal/15";

  const pillBase =
    "px-5 py-2.5 rounded-full border text-sm font-heading font-medium tracking-wide transition-all duration-300 cursor-pointer select-none";

  const pillInactive =
    "border-charcoal/20 text-charcoal/55 hover:border-deep-green/50 hover:text-deep-green";

  const pillActive = "border-deep-green bg-deep-green text-light-grey shadow-sm";
  const chipActive = "border-sage bg-sage text-light-grey shadow-sm";

  return (
    <section
      ref={sectionRef}
      className="relative bg-light-grey overflow-hidden"
      id="contact"
    >
      {/* Ghost watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none">
        <span
          className="font-heading font-bold text-charcoal/[0.028] whitespace-nowrap"
          style={{ fontSize: "clamp(7rem, 20vw, 24rem)" }}
        >
          Let&apos;s Talk
        </span>
      </div>

      {/* Top border rule */}
      <div className="absolute top-0 left-0 right-0 h-px bg-charcoal/8" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-28 md:py-44">
        {/* Section label */}
        <span className="contact-left inline-block text-xs tracking-[0.35em] uppercase text-sage font-heading mb-16">
          Get In Touch
        </span>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-16 lg:gap-32">
          {/* â”€â”€ LEFT â€” Intro & contact info â”€â”€ */}
          <div className="lg:sticky lg:top-32 lg:self-start">
            <h2
              ref={headingRef}
              className="font-heading font-bold leading-[1.05] mb-8"
              style={{
                fontSize: "clamp(2.5rem, 5vw, 5.5rem)",
                perspective: "400px",
              }}
            >
              <span className="contact-line block overflow-hidden text-charcoal">
                Let&apos;s Start
              </span>
              <span className="contact-line block overflow-hidden italic text-sage">
                Your Project
              </span>
            </h2>

            <p className="contact-left text-charcoal/50 text-lg leading-relaxed mb-12 max-w-[340px]">
              Share your vision and we&apos;ll get back to you to discuss how we
              can bring it to life — on time, on budget, and beyond expectation.
            </p>

            <div className="contact-left pt-8 border-t border-charcoal/10 flex flex-col gap-7">
              {/* Lebanon */}
              <div>
                <p className="text-[10px] tracking-[0.35em] uppercase text-sage font-heading mb-1.5">
                  Lebanon
                </p>
                <a
                  href={`tel:${BRAND.contact.lebanon.phone.replace(/\s/g, "")}`}
                  className="text-charcoal/60 hover:text-charcoal text-lg font-light transition-colors duration-300"
                  data-hover
                >
                  {BRAND.contact.lebanon.phone}
                </a>
              </div>
              {/* Saudi Arabia */}
              <div>
                <p className="text-[10px] tracking-[0.35em] uppercase text-sage font-heading mb-1.5">
                  Saudi Arabia
                </p>
                <a
                  href={`tel:${BRAND.contact.saudi.phone.replace(/\s/g, "")}`}
                  className="text-charcoal/60 hover:text-charcoal text-lg font-light transition-colors duration-300"
                  data-hover
                >
                  {BRAND.contact.saudi.phone}
                </a>
              </div>
            </div>
          </div>

          {/* â”€â”€ RIGHT â€” Form â”€â”€ */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-10"
          >
            {/* â”€ Personal Info â”€ */}
            <div className="contact-field grid grid-cols-1 gap-9">
              {/* Full Name */}
              <div>
                <label className="text-[10px] tracking-[0.32em] uppercase font-heading text-charcoal/40 block mb-3">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Your full name"
                  autoComplete="name"
                  className={`${inputBase} ${inputBorder("name")}`}
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  onFocus={() => setFocused("name")}
                  onBlur={() => setFocused(null)}
                />
              </div>

              {/* Email */}
              <div>
                <label className="text-[10px] tracking-[0.32em] uppercase font-heading text-charcoal/40 block mb-3">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  autoComplete="email"
                  className={`${inputBase} ${inputBorder("email")}`}
                  value={form.email}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, email: e.target.value }))
                  }
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused(null)}
                />
              </div>

              {/* Phone */}
              <div>
                <label className="text-[10px] tracking-[0.32em] uppercase font-heading text-charcoal/40 block mb-3">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+961 3 000 000"
                  autoComplete="tel"
                  className={`${inputBase} ${inputBorder("phone")}`}
                  value={form.phone}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, phone: e.target.value }))
                  }
                  onFocus={() => setFocused("phone")}
                  onBlur={() => setFocused(null)}
                />
              </div>
            </div>

            {/* â”€ Country â”€ */}
            <div className="contact-field">
              <label className="text-[10px] tracking-[0.32em] uppercase font-heading text-charcoal/40 block mb-4">
                Country
              </label>
              <div className="flex flex-wrap gap-3">
                {COUNTRIES.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, country: c.id }))}
                    className={`${pillBase} ${
                      form.country === c.id ? pillActive : pillInactive
                    }`}
                  >
                    <span className="mr-1.5">{c.flag}</span>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <hr className="contact-field border-charcoal/10" />

            {/* â”€ Project Type â”€ */}
            <div className="contact-field">
              <label className="text-[10px] tracking-[0.32em] uppercase font-heading text-charcoal/40 block mb-4">
                Type of Project
              </label>
              <div className="flex flex-wrap gap-3">
                {PROJECT_TYPES.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() =>
                      setForm((p) => ({ ...p, projectType: type.id }))
                    }
                    className={`${pillBase} ${
                      form.projectType === type.id ? pillActive : pillInactive
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* â”€ Services â”€ */}
            <div className="contact-field">
              <label className="text-[10px] tracking-[0.32em] uppercase font-heading text-charcoal/40 block mb-1.5">
                Services Required
              </label>
              <p className="text-charcoal/30 text-xs font-body mb-4 tracking-wide">
                Select all that apply
              </p>
              <div className="flex flex-wrap gap-3">
                {SERVICES.map((service) => {
                  const active = form.services.includes(service.id);
                  return (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => toggleService(service.id)}
                      className={`${pillBase} ${
                        active ? chipActive : pillInactive
                      }`}
                    >
                      {active && (
                        <span className="inline-flex items-center justify-center w-4 h-4 mr-1.5 rounded-full bg-light-grey/20 text-[9px] font-bold">
                          ✓
                        </span>
                      )}
                      {service.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* â”€ Submit â”€ */}
            <div className="contact-field pt-2">
              <button
                type="submit"
                disabled={submitStatus === "loading" || submitStatus === "success"}
                className="group inline-flex items-center gap-3 px-10 py-4 bg-deep-green text-light-grey font-heading font-semibold text-sm tracking-[0.2em] uppercase rounded-full transition-all duration-300 hover:bg-sage hover:gap-4 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:gap-3 disabled:hover:bg-deep-green"
                data-hover
                data-cursor-text="Send"
              >
                {submitStatus === "loading" ? "Sending..." : "Send Enquiry"}
                {submitStatus !== "loading" && (
                  <svg
                    width="16"
                    height="16"
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

              {submitStatus === "success" && (
                <p className="mt-5 text-sm font-body text-deep-green tracking-wide leading-relaxed">
                  Your enquiry has been sent — check your email for a confirmation. We&apos;ll be in touch shortly.
                </p>
              )}

              {submitStatus === "error" && (
                <p className="mt-5 text-sm font-body text-red-500 tracking-wide">
                  {errorMessage}
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
