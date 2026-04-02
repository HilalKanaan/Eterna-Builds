"use client";

import { useEffect, useRef } from "react";

/**
 * Generates a small noise texture as a base64 data URI.
 * Done once on mount, then CSS animation handles the rest.
 */
function generateNoiseDataURI(size = 100): string {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  const imageData = ctx.createImageData(size, size);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const v = Math.random() * 255;
    data[i] = v;     // R
    data[i + 1] = v; // G
    data[i + 2] = v; // B
    data[i + 3] = 25; // Alpha (~10% opacity in the texture itself)
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL("image/png");
}

export default function FilmGrain() {
  const grainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = grainRef.current;
    if (!el) return;

    const noiseURI = generateNoiseDataURI();
    el.style.backgroundImage = `url(${noiseURI})`;
  }, []);

  return (
    <div
      ref={grainRef}
      className="film-grain"
      aria-hidden="true"
    />
  );
}
