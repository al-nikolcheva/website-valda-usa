// Build the calendar page data (posts, captions, small slide images) -> JSON on stdout.
// node social/tools/calendar-data.mjs > data.json
import fs from 'node:fs'; import vm from 'node:vm'; import path from 'node:path'; import { execFileSync } from 'node:child_process';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const ctx = { window: {} }; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(`${root}/social/posts/posts.js`, 'utf8').replace(/^const /gm, 'var '), ctx);
const MON = { Oct: '10', Nov: '11', Dec: '12' };
const SCHEDULED = new Set(['2026-10-15', '2026-10-16', '2026-10-20', '2026-10-22', '2026-10-23', '2026-10-27', '2026-10-29', '2026-10-30']);
const TODAY = '2026-10-16';
const small = (file, w = 360) => {
  const out = execFileSync('ffmpeg', ['-v', 'error', '-i', file, '-vf', `scale=${w}:-2`, '-frames:v', '1', '-q:v', '6', '-f', 'mjpeg', 'pipe:1'], { maxBuffer: 1 << 24 });
  return 'data:image/jpeg;base64,' + out.toString('base64');
};
const posts = [];
for (const p of ctx.window.POSTS) {
  if (p.parked || !p.date) continue;
  const [d, m] = p.date.split(' '); const iso = `2026-${MON[m]}-${d}`;
  const folder = `${MON[m]}.${d} ${p.day} - ${String(p.n).padStart(2, '0')} ${p.title}`;
  const ig = `${root}/social-media/Instagram/${folder}`, li = `${root}/social-media/LinkedIn/${folder}`;
  if (!fs.existsSync(ig)) { console.error('missing', folder); continue; }
  const note = f => fs.readFileSync(f, 'utf8');
  const time = f => (note(f).match(/POST AT: (.+)/) || [])[1] || '';
  let slides = fs.readdirSync(ig).filter(f => /^Slide \d+\.png$/.test(f)).sort((a, b) => parseInt(a.slice(6)) - parseInt(b.slice(6))).map(f => small(`${ig}/${f}`));
  let video = null;
  if (p.video) { const v = `${root}/social-media/Extras/${p.video}`;
    slides = [0.8, 6, 12].map(t => { const out = execFileSync('ffmpeg', ['-v', 'error', '-ss', String(t), '-i', v, '-vf', 'scale=270:-2', '-frames:v', '1', '-q:v', '6', '-f', 'mjpeg', 'pipe:1']); return 'data:image/jpeg;base64,' + out.toString('base64'); });
    video = Math.round(parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', v]).toString())); }
  posts.push({ date: iso, day: p.day, pillar: p.arm, title: p.title, video,
    status: iso < TODAY ? 'posted' : SCHEDULED.has(iso) ? 'scheduled' : 'to approve',
    tags: p.tag || [], link: p.link || '',
    li: { time: time(`${li}/Posting notes.txt`), caption: note(`${li}/Caption.txt`) },
    ig: { time: time(`${ig}/Posting notes.txt`), caption: note(`${ig}/Caption.txt`) }, slides });
}
const blogs = [
  { date: '2026-10-12', title: 'What U-factor tells you', status: 'live' },
  { date: '2026-10-14', title: 'Thermal break explained', status: 'live' },
  { date: '2026-10-14', title: 'Triple glazing: is it worth it?', status: 'live' },
  { date: '2026-10-14', title: 'Tilt and turn windows in the US', status: 'live' }];
process.stdout.write(JSON.stringify({ updated: TODAY, posts, blogs }));
