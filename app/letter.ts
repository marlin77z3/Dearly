export type Theme = "sunset" | "stars" | "garden";

export const THEMES: { id: Theme; name: string; glyph: string; middle: string }[] = [
  { id: "sunset", name: "Atardecer", glyph: "✳", middle: "♥" },
  { id: "stars", name: "Estrellado", glyph: "✦", middle: "✧" },
  { id: "garden", name: "Jardín", glyph: "❋", middle: "✿" },
];

/** Lo que viaja dentro del enlace de una carta. */
export type LetterData = {
  c: string[]; // colores
  t: Theme;
  d: string; // fecha yyyy-mm-dd o ""
  m: string; // mensaje
  to: string;
  from: string;
  y?: string; // id del video de YouTube
  s?: string; // canción
  a?: string; // artista
};

export function formatDate(d: string) {
  if (!d) return null;
  const [y, m, day] = d.split("-").map(Number);
  if (!y || !m || !day) return null;
  return new Date(y, m - 1, day).toLocaleDateString("es", { day: "numeric", month: "long", year: "numeric" });
}

/** Comprime la carta y la convierte en texto seguro para una URL (solo en el navegador). */
export async function encodeLetter(data: LetterData): Promise<string> {
  const bytes = new TextEncoder().encode(JSON.stringify(data));
  const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream("deflate-raw"));
  const packed = new Uint8Array(await new Response(stream).arrayBuffer());
  let bin = "";
  packed.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
