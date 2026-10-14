// Isometric tilt-and-turn window drawings -> social/assets/iso-{closed,tilt,turn}.png
// node social/tools/iso-tilt-turn.mjs
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import path from 'node:path';
const OUT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../assets');
const YAW = -38 * Math.PI / 180, PITCH = 24 * Math.PI / 180, S = 6.4;
const rot = ([x, y, z]) => { // camera: yaw about Y, then pitch about X
  const x1 = x * Math.cos(YAW) + z * Math.sin(YAW), z1 = -x * Math.sin(YAW) + z * Math.cos(YAW);
  const y2 = y * Math.cos(PITCH) - z1 * Math.sin(PITCH), z2 = y * Math.sin(PITCH) + z1 * Math.cos(PITCH);
  return [x1, y2, z2];
};
const scr = p => { const [x, y] = rot(p); return [560 + x * S, 860 - y * S]; };
const sub = (a, b) => a.map((v, i) => v - b[i]), cross = (a, b) => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
// a box as 6 quads, transformed by f
function box([x0, y0, z0], [x1, y1, z1], style, f = p => p) {
  const v = (x, y, z) => f([x, y, z]);
  const q = [
    [v(x0,y0,z1), v(x1,y0,z1), v(x1,y1,z1), v(x0,y1,z1)], [v(x1,y0,z0), v(x0,y0,z0), v(x0,y1,z0), v(x1,y1,z0)],
    [v(x0,y1,z1), v(x1,y1,z1), v(x1,y1,z0), v(x0,y1,z0)], [v(x0,y0,z0), v(x1,y0,z0), v(x1,y0,z1), v(x0,y0,z1)],
    [v(x1,y0,z1), v(x1,y0,z0), v(x1,y1,z0), v(x1,y1,z1)], [v(x0,y0,z0), v(x0,y0,z1), v(x0,y1,z1), v(x0,y1,z0)]];
  const shade = [style.front, style.front, style.top, style.top, style.side, style.side];
  return q.map((pts, i) => ({ pts, fill: shade[i], stroke: style.stroke, sw: style.sw || 1.2 }));
}
const quad = (pts, fill, stroke = 'none', op = 1) => [{ pts, fill, stroke, sw: 1, op, glass: true }];
const FRAME = { front: '#f3f3f2', top: '#e2e2e0', side: '#d3d3d1', stroke: '#2b2b2d' };
const SASH = { front: '#eef2f8', top: '#dde5f0', side: '#ccd7e6', stroke: '#1f4e8c', sw: 1.4 };
const HANDLE = { front: '#2b2b2d', top: '#444', side: '#1a1a1a', stroke: '#111', sw: .6 };
const W = 90, H = 130, T = 7, D = 12;                  // frame outer size, member width, depth
const SX0 = T - 1, SX1 = W - T + 1, SY0 = T - 1, SY1 = H - T + 1, ST = 7, SD = 9; // sash

function scene(mode, k) {
  // sash transform: tilt = rotate about bottom edge (x axis at y=SY0, z=D), turn = about left edge (y axis at x=SX0)
  const a = mode === 'tilt' ? 13 * Math.PI / 180 * k : mode === 'turn' || mode === 'casein' ? 72 * Math.PI / 180 * k : mode === 'caseout' ? -68 * Math.PI / 180 * k : 0;
  const f = mode === 'tilt' ? ([x, y, z]) => { const dy = y - SY0, dz = z - D; return [x, SY0 + dy * Math.cos(a) - dz * Math.sin(a), D + dy * Math.sin(a) + dz * Math.cos(a)]; }
          : mode === 'turn' || mode === 'casein' || mode === 'caseout' ? ([x, y, z]) => { const dx = x - SX0, dz = z - D; return [SX0 + dx * Math.cos(a) - dz * Math.sin(a), y, D + dx * Math.sin(a) + dz * Math.cos(a)]; }
          : p => p;
  const faces = [];
  // frame members
  faces.push(...box([0, 0, 0], [W, T, D], FRAME), ...box([0, H - T, 0], [W, H, D], FRAME),
             ...box([0, T, 0], [T, H - T, D], FRAME), ...box([W - T, T, 0], [W, H - T, D], FRAME));
  // sill
  faces.push(...box([-4, -3, -2], [W + 4, 0, D + 8], { front: '#e9e9e7', top: '#f7f7f6', side: '#d6d6d4', stroke: '#2b2b2d' }));
  // sash members (sit slightly proud of the frame, toward the room)
  const z0 = D - SD + 3, z1 = D + 3;
  faces.push(...box([SX0, SY0, z0], [SX1, SY0 + ST, z1], SASH, f), ...box([SX0, SY1 - ST, z0], [SX1, SY1, z1], SASH, f),
             ...box([SX0, SY0 + ST, z0], [SX0 + ST, SY1 - ST, z1], SASH, f), ...box([SX1 - ST, SY0 + ST, z0], [SX1, SY1 - ST, z1], SASH, f));
  // glass
  const gz = (z0 + z1) / 2;
  faces.push(...quad([[SX0 + ST, SY0 + ST, gz], [SX1 - ST, SY0 + ST, gz], [SX1 - ST, SY1 - ST, gz], [SX0 + ST, SY1 - ST, gz]].map(f), '#c9d8eb', '#1f4e8c', .55));
  // handle on the right stile, room side: down = closed, sideways = turn, up = tilt
  const hx = SX1 - ST / 2, hy = (SY0 + SY1) / 2, hz = z1;
  faces.push(...box([hx - 1.6, hy - 2.5, hz], [hx + 1.6, hy + 2.5, hz + 2], HANDLE, f));
  const lever = mode === 'casein' || mode === 'caseout' ? [[hx - 1, hy - 13, hz + 2], [hx + 1, hy, hz + 4]] : mode === 'tilt' ? [[hx - 1, hy, hz + 2], [hx + 1, hy + 13, hz + 4]] : mode === 'turn' ? [[hx - 13, hy - 1, hz + 2], [hx, hy + 1, hz + 4]] : [[hx - 1, hy - 13, hz + 2], [hx + 1, hy, hz + 4]];
  faces.push(...box(lever[0], lever[1], HANDLE, f));
  return { faces, f };
}

function svg(mode) {
  const { faces, f } = scene(mode, 1);
  const vis = faces.filter(fc => {
    if (fc.glass) return true;
    const r = fc.pts.map(rot), n = cross(sub(r[1], r[0]), sub(r[2], r[0]));
    return n[2] > 0;
  });
  vis.sort((a, b) => a.pts.map(rot).reduce((s, p) => s + p[2], 0) / a.pts.length - b.pts.map(rot).reduce((s, p) => s + p[2], 0) / b.pts.length);
  const poly = fc => `<polygon points="${fc.pts.map(scr).map(p => p.map(v => v.toFixed(1)).join(',')).join(' ')}" fill="${fc.fill}" stroke="${fc.stroke}" stroke-width="${fc.sw}" stroke-linejoin="round" ${fc.op ? `fill-opacity="${fc.op}"` : ''}/>`;
  // motion arrow: path of the moving corner from closed to open
  let arrow = '';
  if (mode !== 'closed') {
    const corner = mode === 'tilt' ? [(SX0 + SX1) / 2, SY1 + 4, D + 3] : [SX1 + 4, SY0 + 10, D + 3];
    const pts = [];
    for (let i = 4; i <= 92; i += 4) { const { f } = scene(mode, i / 100); pts.push(scr(f(corner))); }
    const d = 'M' + pts.map(p => p.map(v => v.toFixed(1)).join(' ')).join(' L');
    const [a, b] = [pts.at(-2), pts.at(-1)], ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
    const head = [[b[0] + 14 * Math.cos(ang), b[1] + 14 * Math.sin(ang)], [b[0] + 14 * Math.cos(ang + 2.5), b[1] + 14 * Math.sin(ang + 2.5)], [b[0] + 14 * Math.cos(ang - 2.5), b[1] + 14 * Math.sin(ang - 2.5)]];
    arrow = `<path d="${d}" fill="none" stroke="#1f4e8c" stroke-width="4" stroke-dasharray="10 8" stroke-linecap="round"/><polygon points="${head.map(p => p.join(',')).join(' ')}" fill="#1f4e8c"/>`;
    // ghost of the closed sash
    const g = [[SX0, SY0, D + 3], [SX1, SY0, D + 3], [SX1, SY1, D + 3], [SX0, SY1, D + 3]].map(scr);
    arrow = `<polygon points="${g.map(p => p.join(',')).join(' ')}" fill="none" stroke="#1f4e8c" stroke-width="1.5" stroke-dasharray="6 6" opacity=".45"/>` + arrow;
  }
  const shadow = `<ellipse cx="${scr([W / 2, 0, D + 30])[0]}" cy="${scr([W / 2, 0, D + 30])[1] + 30}" rx="300" ry="90" fill="url(#sh)"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1100" viewBox="0 0 1080 1100">
<defs><radialGradient id="sh"><stop offset="0" stop-color="#000" stop-opacity=".12"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient></defs>
${shadow}${vis.map(poly).join('')}${arrow}</svg>`;
}

const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1100 } });
for (const m of (process.argv[2] ? process.argv.slice(2) : ['closed', 'tilt', 'turn'])) {
  await p.setContent(`<body style="margin:0;background:transparent">${svg(m)}</body>`);
  await p.screenshot({ path: `${OUT}/iso-${m}.png`, omitBackground: true, clip: { x: 0, y: 0, width: 1080, height: 1100 } });
}
await b.close(); console.log('wrote iso-closed/tilt/turn.png');
