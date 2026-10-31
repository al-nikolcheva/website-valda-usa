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
// Slides from video stills were too soft, so November uses sharp project photos, drawings and text-only black slides.
plan('2026-11-03', 'Tue', 'Behind the Build', 'Behind the Build: GORA', 'ready', ex(`${X}/Behind the Build - GORA`),
  "Behind the Build: GORA, Sofia.\n\nA residential building built around light and the view. Slim aluminum tilt and turn windows and minimal-frame sliding systems connect every apartment to the outside.\n\nArchitect: [to confirm]\n\nPlanning a residential project? Send us your openings.\n\n#behindthebuild #architecture #aluminumwindows #europeanwindows");
plan('2026-11-05', 'Thu', 'This or that', 'Inswing or outswing?', 'ready', ex(`${X}/This or that - Inswing or outswing`),
  "Inswing or outswing? A or B, tell us in the comments.\n\nA. Inswing: opens into the room, the European standard, often with a tilt position too. Clean the outside glass from inside.\n\nB. Outswing: the familiar US casement. Takes no space inside the room.\n\nWe make both.\n\n#windows #casementwindows #architecture #europeanwindows");
plan('2026-11-06', 'Fri', 'Educational', 'Questions we get: who clears US customs?', 'ready', ex(`${X}/Questions we get - Customs`),
  "Who clears US customs on European windows?\n\nWe can, or your own customs broker can. Your choice on every order.\n\n1. Export documents prepared at our factory in Bulgaria\n2. Clearance at the US port of arrival\n3. Delivery by truck to your site, coast to coast\n\nOne point of contact from the factory to the final window.\n\n#importing #customs #europeanwindows #construction");
plan('2026-11-10', 'Tue', 'Educational', 'Six ways a window opens', 'concept', [small(`${A}/concepts/iso-casein.jpg`), small(`${A}/concepts/iso-tilt.jpg`)],
  "IDEA: a carousel of isometric drawings (casement in, casement out, tilt, turn, sliding, fixed), one per slide on the warm paper background. Saveable.");
plan('2026-11-12', 'Thu', 'Educational', 'Before you order: five checks', 'ready', ex(`${X}/Before you order - Five checks`),
  "Ordering European windows for a US project? Check these five things first.\n\n1. The approval for your wind zone\n2. The U-factor for your climate\n3. The opening direction and screens\n4. The lead time, including the Atlantic crossing\n5. Who handles customs and delivery\n\nSend us your openings and we will check all five for you.\n\n#architects #specification #europeanwindows #construction");
plan('2026-11-13', 'Fri', 'Educational', 'Window glossary: five numbers', 'ready', ex(`${X}/Window glossary`),
  "Five numbers on every window spec, in plain words.\n\nU-factor: heat through the whole window. Lower is better.\nSHGC: the sun's heat that gets through. Lower keeps rooms cooler.\nVT: daylight that gets through. Higher is brighter.\nSTC: noise blocked. Higher is quieter.\nDP: the wind load it is rated for. Higher is stronger.\n\nSave this for your next spec.\n\n#architects #windowspecs #buildingperformance #energyefficiency");
plan('2026-11-19', 'Thu', 'Educational', 'Myth: aluminum windows are cold', 'concept', [small(`${A}/concepts/myth.jpg`)],
  "IDEA: myth or fact carousel from the thermal break animation: myth, then, now, the number 0.14, fact.", 'https://valdagroup.com/insights/thermal-break-explained');
plan('2026-11-20', 'Fri', 'Behind the Build', 'Behind the Build: Mona Residence', 'ready', ex(`${X}/Behind the Build - Mona`),
  "Behind the Build: Mona Residence, Sofia.\n\nA multifamily building glazed throughout with VALDA aluminum tilt and turn windows. Warm timber accents and large openings give every elevation depth and a steady rhythm.\n\nArchitect: [to confirm]\n\nPlanning a multifamily project? Send us your openings.");
plan('2026-11-27', 'Fri', 'Behind the Build', 'Behind the Build: Juneau Village', 'concept', [small(`${IMG}/project-milwaukee-1.jpg`), small(`${IMG}/project-milwaukee-2.jpg`)],
  "IDEA: Behind the Build, project 03. Juneau Village, Milwaukee: our US project, curtain wall and operable windows, from the real project photos.");
posts.sort((a, b) => a.date.localeCompare(b.date));

const blogs = [
  { date: '2026-10-12', title: 'What U-factor tells you', status: 'live' },
  { date: '2026-10-14', title: 'Thermal break explained', status: 'live' },
  { date: '2026-10-14', title: 'Triple glazing: is it worth it?', status: 'live' },
  { date: '2026-10-14', title: 'Tilt and turn windows in the US', status: 'live' }];
process.stdout.write(JSON.stringify({ updated: TODAY, posts, blogs }));
