// Render a "How It's Made" episode: ep.html + <slug>.json + narration -> 1080x1920 MP4 with voice.
// 1) narrate:  venv/bin/python voice.py ep01.json model_quantized.onnx voices.npz
// 2) render:   node render.mjs ep01 "../../social-media/Extras/How It's Made 01.mp4" [--preview]
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'node:fs'; import path from 'node:path'; import { execFileSync } from 'node:child_process';
const [slug, out, flag] = process.argv.slice(2); const FPS = 30;
const dir = path.dirname(new URL(import.meta.url).pathname);
const cfg = JSON.parse(fs.readFileSync(`${dir}/${slug}.json`, 'utf8'));
const tim = JSON.parse(fs.readFileSync(`${dir}/audio/${slug}.timings.json`, 'utf8'));
const EP = { episode: cfg.episode, duration: tim.duration,
  scenes: cfg.scenes.map((s, i) => ({ ...s, show: s.show || s.say.replace(/P V C/g, 'PVC'), ...tim.scenes[i] })) };
fs.mkdirSync(`${dir}/out`, { recursive: true });
fs.writeFileSync(`${dir}/out/${slug}.data.js`, `window.EP=${JSON.stringify(EP)};`);
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
await p.goto(`file://${dir}/ep.html?ep=${slug}`); await p.evaluate(() => document.fonts.ready);
if (flag === '--preview') { // one still per scene, near the end of its narration
  for (const [i, s] of EP.scenes.entries()) { await p.evaluate(t => window.render(t), s.start + s.speech * .97); await p.screenshot({ path: `${out}-${i + 1}.png` }); }
  await b.close(); process.exit(0);
}
const tmp = fs.mkdtempSync('/tmp/ep-'); const N = Math.round(EP.duration * FPS);
for (let i = 0; i < N; i++) { await p.evaluate(t => window.render(t), i / FPS); await p.screenshot({ path: `${tmp}/f${String(i).padStart(5, '0')}.png` }); }
await b.close();
execFileSync('ffmpeg', ['-v', 'error', '-y', '-framerate', String(FPS), '-i', `${tmp}/f%05d.png`, '-i', `${dir}/audio/${slug}.wav`,
  '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '19', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', out]);
fs.rmSync(tmp, { recursive: true }); console.log('wrote', out, N, 'frames');
