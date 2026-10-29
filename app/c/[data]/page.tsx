import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import LetterView from "../../crear/LetterView";
import { formatDate } from "../../letter";
import { decodeLetter } from "./decode";
import "../../crear/create.css";

type Props = { params: Promise<{ data: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const letter = decodeLetter((await params).data);
  return {
    title: letter?.to ? `Una carta para ${letter.to} · Dearly` : "Una carta · Dearly",
    robots: { index: false },
  };
}

export default async function LetterPage({ params }: Props) {
  const letter = decodeLetter((await params).data);
  if (!letter) notFound();

  const vars = { "--c1": letter.c[0], "--c2": letter.c[1] ?? letter.c[0] } as React.CSSProperties;

  return (
    <div className="page-create view" style={vars}>
      <div className="view-card">
        <LetterView
          theme={letter.t}
          to={letter.to}
          message={letter.m}
          dateText={formatDate(letter.d)}
          song={letter.y ? { id: letter.y, song: letter.s ?? "", artist: letter.a ?? "" } : null}
          from={letter.from}
        />
        <p className="view-foot">
          Hecha con <Link href="/">dearly<span>.</span></Link> · <Link href="/crear">Crea la tuya</Link>
        </p>
      </div>
    </div>
  );
}
