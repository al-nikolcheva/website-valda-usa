"use client";

import { useState } from "react";
import "./openings.css";

export type OpeningType = "fixed" | "casement" | "awning" | "hopper" | "tt" | "sliding" | "liftslide" | "folding" | "door";

const HANDLE = `<svg viewBox="0 0 40 130" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="hp" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#3c4145"/><stop offset=".16" stop-color="#eef1f3"/>
      <stop offset=".38" stop-color="#9ba1a6"/><stop offset=".54" stop-color="#c8cdd1"/>
      <stop offset=".74" stop-color="#4b5055"/><stop offset="1" stop-color="#22262a"/>
    </linearGradient>
  </defs>
  <rect x="10" y="6" width="20" height="62" rx="8" fill="url(#hp)" stroke="#1c1f22" stroke-width="1"/>
  <rect x="11.5" y="7.5" width="17" height="6" rx="3" fill="rgba(255,255,255,.35)"/>
  <circle cx="20" cy="17" r="1.5" fill="#1a1d2099"/><circle cx="20" cy="57" r="1.5" fill="#1a1d2099"/>
  <rect x="13" y="40" width="14" height="82" rx="7" fill="url(#hp)" stroke="#1c1f22" stroke-width="1"/>
  <rect x="15.4" y="44" width="3.4" height="74" rx="1.7" fill="rgba(255,255,255,.62)"/>
</svg>`;

export const SYM: Record<OpeningType, string> = {
  fixed: `<rect x="8" y="6" width="36" height="48"/>`,
  casement: `<rect x="8" y="6" width="36" height="48"/><line class="dash" x1="8" y1="6" x2="44" y2="30"/><line class="dash" x1="8" y1="54" x2="44" y2="30"/>`,
  awning: `<rect x="8" y="6" width="36" height="48"/><line class="dash" x1="8" y1="6" x2="26" y2="54"/><line class="dash" x1="44" y1="6" x2="26" y2="54"/>`,
  hopper: `<rect x="8" y="6" width="36" height="48"/><line class="dash" x1="8" y1="54" x2="26" y2="6"/><line class="dash" x1="44" y1="54" x2="26" y2="6"/>`,
  tt: `<rect x="8" y="6" width="36" height="48"/><line class="dash" x1="8" y1="6" x2="44" y2="30"/><line class="dash" x1="8" y1="54" x2="44" y2="30"/><line class="dash" x1="8" y1="54" x2="26" y2="6"/><line class="dash" x1="44" y1="54" x2="26" y2="6"/>`,
  door: `<rect x="16" y="3" width="20" height="54"/><line class="dash" x1="16" y1="3" x2="36" y2="30"/><line class="dash" x1="16" y1="57" x2="36" y2="30"/>`,
  sliding: `<rect x="4" y="14" width="44" height="32"/><line x1="26" y1="14" x2="26" y2="46"/><path d="M30 30 h12 M38 26 l4 4 -4 4"/>`,
  liftslide: `<rect x="4" y="14" width="44" height="32"/><line x1="26" y1="14" x2="26" y2="46"/><path d="M20 30 v-8 M16 26 l4-4 4 4"/><path d="M30 34 h12 M38 30 l4 4 -4 4"/>`,
  folding: `<rect x="4" y="14" width="44" height="32"/><line x1="15" y1="14" x2="15" y2="46"/><line x1="26" y1="14" x2="26" y2="46"/><line x1="37" y1="14" x2="37" y2="46"/><path d="M6 30 l9 -7 l11 7 l11 -7 l9 7"/>`,
};

const single = (t: string) =>
  `<div class="win ${t}"><div class="jamb"></div><div class="frame"></div><div class="sash"><div class="glass"></div><div class="handle">${HANDLE}</div></div></div>`;
const slider = (t: string, handleHtml: string) =>
  `<div class="win ${t} wide"><div class="jamb"></div><div class="frame"></div><div class="leaf fixedleaf"><div class="glass"></div></div><div class="sash"><div class="glass"></div>${handleHtml}</div></div>`;
const doorHtml = `<div class="win door"><div class="jamb"></div><div class="frame"></div><div class="threshold"></div><div class="sash doorleaf"><div class="glass"></div><div class="drail"></div><div class="pullbar"></div></div></div>`;
const foldingHtml = `<div class="win folding wide"><div class="jamb"></div><div class="frame"></div><div class="foldset"><div class="fleaf f1"><div class="glass"></div></div><div class="fleaf f2"><div class="glass"></div></div><div class="fleaf f3"><div class="glass"></div></div><div class="fleaf f4"><div class="glass"></div></div></div></div>`;

const WIN: Record<OpeningType, string> = {
  fixed: single("fixed"),
  casement: single("casement"),
  awning: single("awning"),
  hopper: single("hopper"),
  tt: single("tt"),
  door: doorHtml,
  sliding: slider("sliding", `<div class="pull"></div>`),
  liftslide: slider("liftslide", `<div class="handle">${HANDLE}</div>`),
  folding: foldingHtml,
};

const META: Record<OpeningType, { name: string; kind: string }> = {
  fixed: { name: "Fixed / Picture", kind: "Non-opening" },
  casement: { name: "Casement", kind: "Side-hung, turn" },
  awning: { name: "Awning", kind: "Top-hung" },
  hopper: { name: "Hopper", kind: "Bottom-hung, inward" },
  tt: { name: "Tilt & Turn", kind: "Turn, then tilt" },
  sliding: { name: "Sliding", kind: "Horizontal slide" },
  liftslide: { name: "Lift & Slide", kind: "Lift then slide" },
  door: { name: "Hinged Door", kind: "Inswing / outswing" },
  folding: { name: "Bi-fold", kind: "Folds to one side" },
};

function OpeningCard({ type }: { type: OpeningType }) {
  const [open, setOpen] = useState(false);
  const m = META[type];
  return (
    <div
      className={`card${open ? " open" : ""}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onClick={() => setOpen((o) => !o)}
    >
      <div
        className="stage"
        dangerouslySetInnerHTML={{ __html: `<div class="floor"></div>${WIN[type]}<div class="contact"></div>` }}
      />
      <div className="row">
        <div>
          <p className="name">{m.name}</p>
          <p className="kind">{m.kind}</p>
        </div>
        <svg className="symbol" viewBox="0 0 52 60" dangerouslySetInnerHTML={{ __html: SYM[type] }} />
      </div>
    </div>
  );
}

export function Openings({ types }: { types: OpeningType[] }) {
  if (!types.length) return null;
  return (
    <div className="vw-openings">
      <div className="grid">
        {types.map((t) => (
          <OpeningCard key={t} type={t} />
        ))}
      </div>
    </div>
  );
}
