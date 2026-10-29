import { NextResponse } from "next/server";

const NOISE =
  /\s*[(\[][^)\]]*(official|oficial|video|vídeo|audio|lyric|letra|visuali[sz]er|\bhd\b|4k|\bmv\b)[^)\]]*[)\]]/gi;

const clean = (s: string) => s.replace(NOISE, "").replace(/\s*\|.*$/, "").trim();

function parse(title: string, channel: string) {
  const t = clean(title);
  const parts = t.split(/\s+[-–—]\s+/);
  if (parts.length >= 2) return { artist: parts[0].trim(), song: parts.slice(1).join(" - ").trim() };
  const artist = channel.replace(/\s*-\s*Topic$/i, "").replace(/\s*VEVO$/i, "").trim();
  return { artist, song: t };
}

export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("id") ?? "";
  if (!/^[\w-]{11}$/.test(id)) return NextResponse.json({ error: "id inválido" }, { status: 400 });

  const res = await fetch(
    `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}&format=json`,
    { next: { revalidate: 86400 } },
  ).catch(() => null);

  if (!res?.ok) return NextResponse.json({ error: "No se encontró el video" }, { status: 404 });

  const data = (await res.json()) as { title: string; author_name: string };
  return NextResponse.json(parse(data.title, data.author_name));
}
