// Build the calendar page data (posts, captions, small slide images) -> JSON on stdout.
// node social/tools/calendar-data.mjs > data.json
import fs from 'node:fs'; import vm from 'node:vm'; import path from 'node:path'; import { execFileSync } from 'node:child_process';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const ctx = { window: {} }; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(`${root}/social/posts/posts.js`, 'utf8').replace(/^const /gm, 'var '), ctx);
const MON = { Oct: '10', Nov: '11', Dec: '12' };
const SCHEDULED = new Set(['2026-10-13', '2026-10-15', '2026-10-16', '2026-10-20', '2026-10-22', '2026-10-23', '2026-10-27', '2026-10-29', '2026-10-30']);
const TODAY = '2026-10-31';
// Slides are written as full-size JPEG files next to the page (OUT/img), so the viewer shows the real post.
const OUT = process.env.CAL_OUT; let nImg = 0;
if (OUT) { fs.rmSync(`${OUT}/img`, { recursive: true, force: true }); fs.rmSync(`${OUT}/vid`, { recursive: true, force: true }); fs.mkdirSync(`${OUT}/img`, { recursive: true }); fs.mkdirSync(`${OUT}/vid`, { recursive: true }); }
const small = (file, w = 1080) => {
  const out = execFileSync('ffmpeg', ['-v', 'error', '-i', file, '-vf', `scale='min(${w},iw)':-2`, '-frames:v', '1', '-q:v', '4', '-f', 'mjpeg', 'pipe:1'], { maxBuffer: 1 << 26 });
  if (!OUT) return 'data:image/jpeg;base64,' + out.toString('base64');
  const name = `img/${String(++nImg).padStart(3, '0')}.jpg`; fs.writeFileSync(`${OUT}/${name}`, out); return name;
};
const posts = [];
const KEEP_NOV = new Set(['Veterans Day', 'Facade systems', 'Spec sheet', 'Thanksgiving']);
for (const p of ctx.window.POSTS) {
  if (p.parked || !p.date) continue;
  if (p.date.endsWith('Nov') && !KEEP_NOV.has(p.title)) continue; // November is re-planned below
  const [d, m] = p.date.split(' '); const iso = `2026-${MON[m]}-${d}`;
  const folder = `${MON[m]}.${d} ${p.day} - ${String(p.n).padStart(2, '0')} ${p.title}`;
  const ig = `${root}/social-media/Instagram/${folder}`, li = `${root}/social-media/LinkedIn/${folder}`;
  if (!fs.existsSync(ig)) { console.error('missing', folder); continue; }
  const note = f => fs.readFileSync(f, 'utf8');
  const time = f => (note(f).match(/POST AT: (.+)/) || [])[1] || '';
  let slides = fs.readdirSync(ig).filter(f => /^Slide \d+\.png$/.test(f)).sort((a, b) => parseInt(a.slice(6)) - parseInt(b.slice(6))).map(f => small(`${ig}/${f}`));
  let video = null, videoSrc = null;
  if (p.video) { const v = `${root}/social-media/Extras/${p.video}`;
    slides = [0.8, 6, 12].map(t => { const out = execFileSync('ffmpeg', ['-v', 'error', '-ss', String(t), '-i', v, '-vf', 'scale=270:-2', '-frames:v', '1', '-q:v', '6', '-f', 'mjpeg', 'pipe:1']); return 'data:image/jpeg;base64,' + out.toString('base64'); });
    video = Math.round(parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', v]).toString()));
    if (OUT) { videoSrc = `vid/${String(p.n).padStart(2, '0')}.mp4`; execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', v, '-vf', 'scale=720:-2', '-c:v', 'libx264', '-crf', '27', '-preset', 'veryfast', '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart', `${OUT}/${videoSrc}`]); } }
  posts.push({ date: iso, day: p.day, pillar: p.arm, title: p.title, video, videoSrc,
    status: iso < TODAY ? 'posted' : SCHEDULED.has(iso) ? 'scheduled' : 'to approve',
    tags: p.tag || [], link: p.link || '',
    li: { time: time(`${li}/Posting notes.txt`), caption: note(`${li}/Caption.txt`) },
    ig: { time: time(`${ig}/Posting notes.txt`), caption: note(`${ig}/Caption.txt`) }, slides });
}
// November re-plan: POV series, Behind the Build, one-number and this-or-that posts.
const ex = d => fs.readdirSync(d).filter(f => /^Slide \d+\.png$/.test(f)).sort((a, b) => parseInt(a.slice(6)) - parseInt(b.slice(6))).map(f => small(`${d}/${f}`));
const A = `${root}/social/assets`, IMG = `${root}/public/images`, X = `${root}/social-media/Extras`;
const T = { li: '10:00 AM ET', ig: '10:00 AM ET' };
const plan = (date, day, pillar, title, status, slides, caption, link = '') =>
  posts.push({ date, day, pillar, title, video: null, status, tags: [], link, li: { time: day === 'Thu' ? '11:00 AM ET' : T.li, caption }, ig: { time: T.ig, caption }, slides });
plan('2026-11-03', 'Tue', 'POV series', 'POV ep 01: made in Sofia', 'ready', ex(`${X}/POV ep01`),
  "POV: your windows are being made in Sofia.\n\nCut, assembled, glazed on our own LISEC line, packed and shipped. Episode 1 of a new series from inside our factories.\n\nNext episode: the glass line.");
plan('2026-11-05', 'Thu', 'One number', '−25%: what a third pane does', 'concept', [small(`${IMG}/home-coast-sunset.webp`)],
  "IDEA: one bold image. \"−25%\" over a muted house photo, with one line: on our Reynaers systems, triple glazing lowers the whole-window U-factor by about a quarter. Links to the triple glazing blog post.", 'https://valdagroup.com/insights/triple-glazing-is-it-worth-it');
plan('2026-11-06', 'Fri', 'Behind the Build', 'Behind the Build: GORA', 'concept', [small(`${IMG}/proj-gora.jpg`), small(`${IMG}/hero-gora.jpg`)],
  "IDEA: Behind the Build, project 02. GORA in the same style as Mona: cover, details, facts, close. Needs the architect and developer to tag.");
plan('2026-11-10', 'Tue', 'Educational', 'Six ways a window opens', 'concept', [small(`${A}/concepts/iso-casein.jpg`), small(`${A}/concepts/iso-tilt.jpg`)],
  "IDEA: a carousel of the six isometric drawings (casement, awning, hopper, tilt and turn, sliding, fixed), one per slide on the warm muted background. Saveable.");
plan('2026-11-12', 'Thu', 'This or that', 'Inswing or outswing?', 'concept', [small(`${A}/concepts/iso-caseout.jpg`)],
  "IDEA: one image with the two isometric casements side by side. Caption asks: A or B, which would you choose? Designed to get comments.");
plan('2026-11-13', 'Fri', 'POV series', 'POV ep 02: the glass line', 'concept', [small(`${A}/concepts/pov02.jpg`)],
  "IDEA: POV episode 2, inside the fully automatic LISEC glass line, same look as episode 1.");
plan('2026-11-19', 'Thu', 'Educational', 'Myth: aluminum windows are cold', 'concept', [small(`${A}/concepts/myth.jpg`)],
  "IDEA: myth or fact carousel from the thermal break animation: myth, then, now, the number 0.14, fact.", 'https://valdagroup.com/insights/thermal-break-explained');
plan('2026-11-20', 'Fri', 'Behind the Build', 'Behind the Build: Mona Residence', 'ready', ex(`${X}/Behind the Build - Mona`),
  "Behind the Build: Mona Residence, Sofia.\n\nA multifamily building glazed throughout with VALDA aluminum tilt and turn windows. Warm timber accents and large openings give every elevation depth and a steady rhythm.\n\nArchitect: [to confirm]\n\nPlanning a multifamily project? Send us your openings.");
plan('2026-11-27', 'Fri', 'POV series', 'POV ep 03: leaving the factory', 'concept', [small(`${A}/concepts/pov03.jpg`)],
  "IDEA: POV episode 3, packing, loading and the trucks leaving for the port.");
posts.sort((a, b) => a.date.localeCompare(b.date));

const blogs = [
  { date: '2026-10-12', title: 'What U-factor tells you', status: 'live' },
  { date: '2026-10-14', title: 'Thermal break explained', status: 'live' },
  { date: '2026-10-14', title: 'Triple glazing: is it worth it?', status: 'live' },
  { date: '2026-10-14', title: 'Tilt and turn windows in the US', status: 'live' }];
process.stdout.write(JSON.stringify({ updated: TODAY, posts, blogs }));
