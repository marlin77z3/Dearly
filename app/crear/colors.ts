export const PRESETS = ["#c99a97", "#e8c4a8", "#a9a3cc", "#a3bccc", "#a6b3a0", "#e8dc9f", "#c27d62", "#a05a62"];
export const MAX_COLORS = 2;

export type Hsv = { h: number; s: number; v: number };

export function hsvToHex({ h, s, v }: Hsv) {
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    const x = v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
    return Math.round(x * 255).toString(16).padStart(2, "0");
  };
  return `#${f(5)}${f(3)}${f(1)}`;
}

export function hexToHsv(hex: string): Hsv {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((x) => x / 255);
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  let h = 0;
  if (d) h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return { h: (h * 60 + 360) % 360, s: max ? d / max : 0, v: max };
}

/** Alterna un color: lo quita si ya está (dejando al menos uno), lo agrega o reemplaza el último. */
export function toggleColor(chosen: string[], color: string) {
  if (chosen.includes(color)) return chosen.length > 1 ? chosen.filter((c) => c !== color) : chosen;
  if (chosen.length < MAX_COLORS) return [...chosen, color];
  return [...chosen.slice(0, MAX_COLORS - 1), color];
}
