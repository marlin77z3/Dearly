"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import CustomColor from "./CustomColor";
import SongPlayer from "./SongPlayer";
import { PRESETS, toggleColor } from "./colors";
import { getVideoId } from "./youtube";

type Theme = "sunset" | "stars" | "garden";

const THEMES: { id: Theme; name: string; glyph: string; middle: string }[] = [
  { id: "sunset", name: "Atardecer", glyph: "✳", middle: "♥" },
  { id: "stars", name: "Estrellado", glyph: "✦", middle: "✧" },
  { id: "garden", name: "Jardín", glyph: "❋", middle: "✿" },
];

export default function CreateForm() {
  const [colors, setColors] = useState({ chosen: [PRESETS[0], PRESETS[1]], custom: null as string | null });
  const [theme, setTheme] = useState<Theme>("sunset");
  const [date, setDate] = useState("");
  const [message, setMessage] = useState("");
  const [to, setTo] = useState("");
  const [from, setFrom] = useState("");
  const [link, setLink] = useState("");
  const [info, setInfo] = useState<{ id: string; song: string; artist: string } | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const videoId = getVideoId(link);

  useEffect(() => {
    setInfo(null);
    if (!videoId) return setStatus(link.trim() ? "error" : "idle");
    setStatus("loading");
    const ctrl = new AbortController();
    fetch(`/api/youtube?id=${videoId}`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: { song: string; artist: string }) => {
        setInfo({ id: videoId, ...d });
        setStatus("idle");
      })
      .catch((e) => e?.name !== "AbortError" && setStatus("error"));
    return () => ctrl.abort();
  }, [videoId, link]);

  const { chosen, custom } = colors;
  const t = THEMES.find((x) => x.id === theme)!;

  const pick = (c: string) => setColors((s) => ({ ...s, chosen: toggleColor(s.chosen, c) }));

  // Crea o cambia el color personalizado; si ya estaba elegido, ocupa su lugar.
  const setCustom = (hex: string) =>
    setColors((s) => {
      const i = s.custom ? s.chosen.indexOf(s.custom) : -1;
      if (i >= 0) return { chosen: s.chosen.map((c, k) => (k === i ? hex : c)), custom: hex };
      return { chosen: toggleColor(s.chosen, hex), custom: hex };
    });

  const dateText = date
    ? (() => {
        const [y, m, d] = date.split("-").map(Number);
        return new Date(y, m - 1, d).toLocaleDateString("es", { day: "numeric", month: "long", year: "numeric" });
      })()
    : null;

  const vars = { "--c1": chosen[0], "--c2": chosen[1] ?? chosen[0] } as React.CSSProperties;

  return (
    <div className="page-create" style={vars}>
      <header className="bar">
        <Link className="logo" href="/">
          dearly<span>.</span>
        </Link>
        <span className="tagline">Cartas que se sienten cerca</span>
      </header>

      <section className="intro">
        <p className="eyebrow">Un detalle hecho por ti</p>
        <h1>
          Hay cosas que merecen
          <br />
          decirse bonito.
        </h1>
        <p className="sub">Escribe una carta, ponle su canción y conviértela en un recuerdo para compartir.</p>
      </section>

      <main className="layout">
        <form
          className="form"
          autoComplete="off"
          onSubmit={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <section className="step">
            <h2>
              <span className="num">01</span>Dale su propio estilo
            </h2>
            <p className="hint">Elige hasta dos colores y un detalle para vestir tu carta.</p>
            <div className="swatches">
              {PRESETS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`sw${chosen.includes(c) ? " on" : ""}`}
                  style={{ background: c }}
                  aria-label={`Color ${c}`}
                  onClick={() => pick(c)}
                />
              ))}
              <CustomColor
                color={custom}
                selected={!!custom && chosen.includes(custom)}
                onChange={setCustom}
                onSelect={() => custom && pick(custom)}
              />
            </div>
            <p className="hint small">
              {chosen.length} de 2 colores elegidos · El color personalizado reemplaza al segundo si ya elegiste dos.
            </p>
            <div className="styles">
              {THEMES.map((x) => (
                <button key={x.id} type="button" className={`style${theme === x.id ? " on" : ""}`} onClick={() => setTheme(x.id)}>
                  <i>{x.glyph}</i>
                  {x.name}
                </button>
              ))}
            </div>
          </section>

          <section className="step">
            <h2>
              <span className="num">02</span>Su fecha especial
            </h2>
            <label htmlFor="date">¿Cuándo se hicieron novios?</label>
            <input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </section>

          <section className="step">
            <h2>
              <span className="num">03</span>Lo que quieres decir
            </h2>
            <label htmlFor="message">Tu mensaje</label>
            <textarea
              id="message"
              maxLength={600}
              placeholder="No hace falta que sea perfecto. Solo que sea tuyo…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <p className="hint small">{message.length}/600 caracteres</p>
          </section>

          <section className="step">
            <h2>
              <span className="num">04</span>¿Para quién es?
            </h2>
            <div className="row">
              <div>
                <label htmlFor="to">Su nombre</label>
                <input id="to" placeholder="¿Cómo le dices?" value={to} onChange={(e) => setTo(e.target.value)} />
              </div>
              <div>
                <label htmlFor="from">Tu nombre</label>
                <input id="from" placeholder="Firma tu carta" value={from} onChange={(e) => setFrom(e.target.value)} />
              </div>
            </div>
          </section>

          <section className="step">
            <h2>
              <span className="num">05</span>Su canción
            </h2>
            <label htmlFor="song">Pega la URL de la canción en YouTube</label>
            <div className="search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
                <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
              </svg>
              <input
                id="song"
                inputMode="url"
                placeholder="https://www.youtube.com/watch?v=…"
                value={link}
                onChange={(e) => setLink(e.target.value)}
              />
            </div>
            <p className={`hint small${status === "error" ? " err" : ""}`}>
              {status === "loading"
                ? "Buscando tu canción…"
                : status === "error"
                  ? "No pudimos leer ese enlace. Pega la URL de un video de YouTube."
                  : info
                    ? "¡Listo! Así se verá en tu carta."
                    : "Copia el enlace del video de YouTube y pégalo aquí."}
            </p>
          </section>

          <button className="submit" type="submit">
            Crear mi carta <span>♡</span>
          </button>
        </form>

        <aside className="side">
          <div className="side-head">
            <b>Una vista previa</b>
            <span>Se transforma contigo</span>
          </div>
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
            {info && <SongPlayer key={info.id} videoId={info.id} song={info.song} artist={info.artist} />}
            <p className="lsign">
              Con cariño,
              <br />
              {from.trim() || "Tu nombre"}
            </p>
          </article>
        </aside>
      </main>
    </div>
  );
}
