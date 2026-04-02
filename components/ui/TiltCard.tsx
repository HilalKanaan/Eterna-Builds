"use client";

import { useTilt } from "@/hooks/useTilt";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
}

export default function TiltCard({ children, className = "" }: TiltCardProps) {
  const { ref, glareRef } = useTilt({ maxTilt: 10, scale: 1.02, speed: 0.4 });

  return (
    <div
      ref={ref}
      className={className}
      style={{ transformStyle: "preserve-3d" }}
    >
      {children}
      {/* Light reflection / glare overlay */}
      <div
        ref={glareRef}
        className="absolute inset-0 z-10 pointer-events-none rounded-lg transition-opacity duration-300"
        style={{ opacity: 0 }}
      />
    </div>
  );
}
