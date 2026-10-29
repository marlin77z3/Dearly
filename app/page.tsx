import Link from "next/link";
import SongPlayer from "./crear/SongPlayer";
import "./home.css";

export default function Home() {
  return (
    <div className="page-home">
      <header className="top">
        <Link className="logo" href="/">
          dearly<span>.</span>
        </Link>
        <span className="tagline">Cartas que se sienten cerca</span>
      </header>

      <main className="hero">
        <section className="copy">
          <p className="eyebrow">Un pequeño espacio para querer</p>
          <h1>
            Algunas cosas
            <br />
            <em>merecen una carta.</em>
          </h1>
          <p className="lead">
            Escribe lo que sientes, elige sus colores y acompáñalo con la canción que cuenta su historia.
          </p>
          <Link className="cta" href="/crear">
            Comenzar
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
              <path d="M5 19L19 5M9 5h10v10" />
            </svg>
          </Link>
          <p className="note">Hecho con cariño, para alguien especial.</p>
        </section>

        <section className="preview" aria-label="Ejemplo de carta">
          <article className="letter">
            <div className="ornament" aria-hidden="true">
              <span>✳</span>
              <i>·</i>
              <b>♥</b>
              <i>·</i>
              <span>✳</span>
            </div>
            <p className="to">Para Addie</p>
            <p className="body">
              Contigo todo se siente más ligero. Gracias por quedarte en los días buenos y en los difíciles. Esta carta es
              para recordarte lo mucho que te quiero.
            </p>
            <p className="since">
              <span>♥</span> Desde el 27 de septiembre de 2026
            </p>

            <SongPlayer videoId="LNaHpezFjng" song="Perfecta" artist="Miranda!, Maria Becerra, FMK" playable={false} />

            <p className="sign">
              Con cariño,
              <br />
              Julian
            </p>
          </article>
        </section>
      </main>
    </div>
  );
}
