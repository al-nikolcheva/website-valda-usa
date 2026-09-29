import * as THREE from "three";
import type { Kit } from "./kit";

export type FlagKind = "bg" | "eu" | "us";

/** Draw a flag in its true colours on a 2:1-ish canvas. */
function drawFlag(kind: FlagKind) {
  const c = document.createElement("canvas");
  c.width = 240;
  c.height = kind === "us" ? 126 : kind === "eu" ? 160 : 144;
  const g = c.getContext("2d");
  if (!g) return c;
  const W = c.width;
  const H = c.height;
  if (kind === "bg") {
    // Bulgaria: white, green, red
    ["#ffffff", "#00966e", "#d62612"].forEach((col, i) => {
      g.fillStyle = col;
      g.fillRect(0, (i * H) / 3, W, H / 3 + 1);
    });
  } else if (kind === "eu") {
    // European Union: 12 gold stars in a circle on blue
    g.fillStyle = "#003399";
    g.fillRect(0, 0, W, H);
    g.fillStyle = "#ffcc00";
    const r = H / 3;
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      star(g, W / 2 + r * Math.cos(a), H / 2 + r * Math.sin(a), H / 18);
    }
  } else {
    // United States: 13 stripes, blue canton with 50 stars
    const s = H / 13;
    for (let i = 0; i < 13; i++) {
      g.fillStyle = i % 2 ? "#ffffff" : "#b22234";
      g.fillRect(0, i * s, W, s + 1);
    }
    const cw = W * 0.4;
    const ch = s * 7;
    g.fillStyle = "#3c3b6e";
    g.fillRect(0, 0, cw, ch);
    g.fillStyle = "#ffffff";
    for (let row = 0; row < 9; row++) {
      const n = row % 2 ? 5 : 6;
      for (let k = 0; k < n; k++) {
        const x = (cw / 12) * (row % 2 ? 2 + k * 2 : 1 + k * 2);
        star(g, x, (ch / 10) * (row + 1), s * 0.32);
      }
    }
  }
  return c;
}

function star(g: CanvasRenderingContext2D, x: number, y: number, r: number) {
  g.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.42 : r;
    g.lineTo(x + rr * Math.cos(a), y + rr * Math.sin(a));
  }
  g.closePath();
  g.fill();
}

/**
 * A flag on a white pole. The cloth is a subdivided plane whose vertices ripple gently (skip when not "life").
 * Returns the group plus a wave(t) function.
 */
export function makeFlag(kit: Kit, kind: FlagKind, poleH = 5, w = 2.1) {
  const g = new THREE.Group();
  kit.shadow(g, 0.2, 0.2, 0.9, 0.9);
  kit.box(g, 0.1, poleH, 0.1, -0.05, 0, -0.05, "white");
  kit.box(g, 0.18, 0.12, 0.18, -0.09, poleH, -0.09, "light", null);
  const tex = kit.track(new THREE.CanvasTexture(drawFlag(kind)));
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  const img = tex.image as HTMLCanvasElement;
  const h = (w * img.height) / img.width;
  const geo = kit.track(new THREE.PlaneGeometry(w, h, 12, 4));
  geo.translate(w / 2 + 0.05, 0, 0);
  const base = Float32Array.from(geo.attributes.position.array as ArrayLike<number>);
  const cloth = new THREE.Mesh(geo, kit.track(new THREE.MeshLambertMaterial({ map: tex, side: THREE.DoubleSide })));
  cloth.position.y = poleH - h / 2 - 0.05;
  g.add(cloth);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const wave = (t: number, life: boolean) => {
    for (let i = 0; i < pos.count; i++) {
      const x = base[i * 3];
      const k = (x - 0.05) / w; // 0 at the pole → 1 at the fly end
      const z = life ? Math.sin(x * 3.2 - t * 3.4) * 0.11 * k + Math.sin(t * 1.3 + x) * 0.03 * k : 0.05 * k;
      pos.setZ(i, z);
      pos.setY(i, base[i * 3 + 1] - (life ? 0.03 * k * k : 0));
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
  };
  wave(0, false);
  return { group: g, wave };
}
