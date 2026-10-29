import SongPlayer from "./SongPlayer";
import { THEMES, type Theme } from "../letter";

type Props = {
  theme: Theme;
  to: string;
  message: string;
  dateText: string | null;
  song: { id: string; song: string; artist: string } | null;
  from: string;
};

export default function LetterView({ theme, to, message, dateText, song, from }: Props) {
  const t = THEMES.find((x) => x.id === theme)!;
  return (
    <article className="letter" data-theme={theme}>
      <div className="orn">
        <span>{t.glyph}</span>
        <i>·</i>
        <b>{t.middle}</b>
        <i>·</i>
        <span>{t.glyph}</span>
      </div>
      <p className="lto">{to.trim() ? `Para ${to.trim()}` : "Para alguien especial"}</p>
      <p className={`lbody${message ? "" : " empty"}`}>{message || "Aquí aparecerán tus palabras bonitas…"}</p>
      {dateText && (
        <p className="lsince">
          <span>♥</span> Desde el {dateText}
        </p>
      )}
      {song && <SongPlayer key={song.id} videoId={song.id} song={song.song} artist={song.artist} />}
      <p className="lsign">
        Con cariño,
        <br />
        {from.trim() || "Tu nombre"}
      </p>
    </article>
  );
}
