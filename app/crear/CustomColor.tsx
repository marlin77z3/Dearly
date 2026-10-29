"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { hexToHsv, hsvToHex, type Hsv } from "./colors";

type Props = {
  color: string | null;
  selected: boolean;
  /** Crea o cambia el color personalizado (y lo deja elegido). */
  onChange: (hex: string) => void;
  /** Elige el color personalizado que ya existe. */
  onSelect: () => void;
};

function useDrag(onMove: (x: number, y: number) => void) {
  const handle = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const clamp = (n: number) => Math.min(1, Math.max(0, n));
    onMove(clamp((e.clientX - r.left) / r.width), clamp((e.clientY - r.top) / r.height));
  };
  return {
    onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
      e.currentTarget.setPointerCapture(e.pointerId);
      handle(e);
    },
    onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) handle(e);
    },
  };
}

export default function CustomColor({ color, selected, onChange, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const [hsv, setHsv] = useState<Hsv>(() => hexToHsv(color ?? "#c99a97"));
  const [hexText, setHexText] = useState<string | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const popRef = useRef<HTMLDivElement>(null);

  const hex = hsvToHex(hsv);

  const update = (next: Hsv) => {
    setHsv(next);
    setHexText(null);
    onChange(hsvToHex(next));
  };

  const svDrag = useDrag((x, y) => update({ ...hsv, s: x, v: 1 - y }));
  const hueDrag = useDrag((x) => update({ ...hsv, h: x * 360 }));

  // Mantiene la tarjeta dentro de la pantalla.
  useLayoutEffect(() => {
    const pop = popRef.current;
    if (!open || !pop) return;
    pop.style.left = "50%";
    const r = pop.getBoundingClientRect();
    const shift = Math.min(0, window.innerWidth - 16 - r.right) + Math.max(0, 16 - r.left);
    pop.style.left = `calc(50% + ${shift}px)`;
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", away);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  const onClick = () => {
    if (!color) onChange(hex);
    else if (selected) setOpen((o) => !o);
    else onSelect();
  };

  return (
    <div className="custom-wrap" ref={wrapRef}>
      <button
        type="button"
        className={`sw custom${color ? " filled" : ""}${selected ? " on" : ""}`}
        style={color ? { background: color } : undefined}
        aria-label="Color personalizado"
        aria-expanded={open}
        onClick={onClick}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
          <path d="M7 1v12M1 7h12" />
        </svg>
      </button>

      {open && (
        <div className="picker" ref={popRef}>
          <p className="picker-title">Tu propio color</p>
          <div className="sv" style={{ ["--hue" as string]: `hsl(${hsv.h} 100% 50%)` }} {...svDrag}>
            <div className="sv-thumb" style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%`, background: hex }} />
          </div>
          <div className="hue" {...hueDrag}>
            <div className="hue-thumb" style={{ left: `${(hsv.h / 360) * 100}%`, background: `hsl(${hsv.h} 100% 50%)` }} />
          </div>
          <div className="picker-row">
            <span className="picker-dot" style={{ background: hex }} />
            <input
              className="picker-hex"
              maxLength={7}
              spellCheck={false}
              aria-label="Código hexadecimal"
              value={hexText ?? hex}
              onChange={(e) => {
                const t = e.target.value;
                setHexText(t);
                const v = t.startsWith("#") ? t : `#${t}`;
                if (/^#[0-9a-f]{6}$/i.test(v)) update(hexToHsv(v));
              }}
              onBlur={() => setHexText(null)}
            />
          </div>
          <button type="button" className="picker-use" onClick={() => setOpen(false)}>
            Listo
          </button>
        </div>
      )}
    </div>
  );
}
