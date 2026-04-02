export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const clamp = (val: number, min: number, max: number) =>
  Math.min(Math.max(val, min), max);

export const mapRange = (
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
) => ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
