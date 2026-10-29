"use client";

import { useEffect, useRef, useState } from "react";
import "../player.css";

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<any> | null = null;
function loadApi(): Promise<any> {
  if (!apiPromise) {
    apiPromise = new Promise((resolve) => {
      if (window.YT?.Player) return resolve(window.YT);
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        prev?.();
        resolve(window.YT);
      };
      const s = document.createElement("script");
      s.src = "https://www.youtube.com/iframe_api";
      document.head.append(s);
    });
  }
  return apiPromise;
}

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

type Props = { videoId: string; song: string; artist: string };

export default function SongPlayer({ videoId, song, artist }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const player = useRef<any>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const wantPlay = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const host = document.createElement("div");
    box.current?.append(host);

    loadApi().then((YT) => {
      if (cancelled) return;
      player.current = new YT.Player(host, {
        videoId,
        width: 200,
        height: 200,
        playerVars: { controls: 0, playsinline: 1, rel: 0, disablekb: 1, origin: window.location.origin },
        events: {
          onReady: (e: any) => {
            setReady(true);
            setDuration(e.target.getDuration() || 0);
            if (wantPlay.current) e.target.playVideo();
          },
          onError: () => setFailed(true),
          onStateChange: (e: any) => {
            setPlaying(e.data === YT.PlayerState.PLAYING);
            if (e.data === YT.PlayerState.ENDED) setTime(0);
            const d = e.target.getDuration?.();
            if (d) setDuration(d);
          },
        },
      });
    });

    return () => {
      cancelled = true;
      player.current?.destroy?.();
      player.current = null;
      if (box.current) box.current.innerHTML = "";
    };
  }, [videoId]);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      const p = player.current;
      if (!p?.getCurrentTime) return;
      setTime(p.getCurrentTime());
      if (!duration) setDuration(p.getDuration() || 0);
    }, 250);
    return () => clearInterval(id);
  }, [playing, duration]);

  const toggle = () => {
    const p = player.current;
    if (!ready || !p?.playVideo) {
      wantPlay.current = !wantPlay.current; // se reproduce apenas cargue
      return;
    }
    if (playing) p.pauseVideo();
    else p.playVideo();
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const p = player.current;
    if (!p?.seekTo || !duration) return;
    const r = e.currentTarget.getBoundingClientRect();
    const t = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)) * duration;
    p.seekTo(t, true);
    setTime(t);
  };

  const pct = duration ? Math.min(100, (time / duration) * 100) : 0;

  return (
    <div className="lplayer">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="lp-cover" src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`} alt="" />
      <div className="lp-meta">
        <strong>{song}</strong>
        <span>{failed ? "Este video no permite reproducirse aquí" : artist}</span>
        <div className="lp-bar" onClick={seek} role="slider" aria-label="Línea de tiempo" aria-valuemin={0} aria-valuemax={Math.round(duration)} aria-valuenow={Math.round(time)}>
          <div className="lp-track">
            <div className="lp-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div className="lp-times">
          <span>{fmt(time)}</span>
          <span>{duration ? fmt(duration) : "--:--"}</span>
        </div>
      </div>
      <button type="button" className="lp-play" onClick={toggle} aria-label={playing ? "Pausar" : "Reproducir"}>
        {playing ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6zM14 4h4v16h-4z" /></svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
        )}
      </button>
      <div className="lp-hidden" ref={box} aria-hidden="true" />
    </div>
  );
}
