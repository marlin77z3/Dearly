import { inflateRawSync } from "node:zlib";
import { THEMES, type LetterData } from "../../letter";

const HEX = /^#[0-9a-f]{6}$/i;
const str = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");

/** Lee y valida el enlace de una carta. Devuelve null si no es válido. */
export function decodeLetter(token: string): LetterData | null {
  try {
    const json = inflateRawSync(Buffer.from(token, "base64url"), { maxOutputLength: 20_000 }).toString("utf8");
    const raw = JSON.parse(json) as Record<string, unknown>;
    const colors = Array.isArray(raw.c) ? raw.c.filter((c): c is string => typeof c === "string" && HEX.test(c)).slice(0, 2) : [];
    if (!colors.length) return null;
    const theme = THEMES.find((t) => t.id === raw.t)?.id ?? "sunset";
    const date = typeof raw.d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(raw.d) ? raw.d : "";
    const y = typeof raw.y === "string" && /^[\w-]{11}$/.test(raw.y) ? raw.y : undefined;
    return {
      c: colors,
      t: theme,
      d: date,
      m: str(raw.m, 600),
      to: str(raw.to, 60),
      from: str(raw.from, 60),
      ...(y ? { y, s: str(raw.s, 120), a: str(raw.a, 120) } : {}),
    };
  } catch {
    return null;
  }
}
