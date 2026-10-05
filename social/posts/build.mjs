// Build every post into ../../social-media/{Instagram,LinkedIn}/MM.DD Day - NN Title/ (parked posts go in Parked/)
// Usage: node build.mjs [n ...]   (no args = all posts)
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'node:fs'; import { execFileSync } from 'node:child_process'; import path from 'node:path'; import vm from 'node:vm';
const ctx={window:{}}; vm.runInNewContext(fs.readFileSync('posts.js','utf8'),ctx);
const POSTS=ctx.window.POSTS, only=process.argv.slice(2).map(Number);
const OUT=path.resolve('../../social-media');
function writeText(p,plat,dir,slides){
  const strip=t=>String(t||'').replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();
  const kind=x=>({photo:'Photo of ',photoType:'Photo of ',card:'Photo of ',photoSlide:'Photo: ',inSitu:'Photo: ',over:'Photo with text: ',systems:'Drawing of a window with text: ',drawing:'Drawing of a window with text: ',sand:'Window profile section with text: ',darkCut:'Window profile section with text: ',section:'Window profile section with text: '}[x.t]||'Text slide: ');
  const alt=slides.map((x,i)=>`Slide ${i+1}: ${kind(x)}${[x.label,x.h,x.d||x.lead||x.cap,x.c].map(strip).filter(Boolean).join('. ')}`.replace(/\.\./g,'.'));
  const cap = plat==='LinkedIn'
    ? `${p.caption}\n\n${p.link?'Read more: '+p.link:'valdagroup.com'}\n\n${p.li} #VALDA`
    : `${p.caption}${p.link?'\n\nMore via the link in bio.':''}\n\n${p.ig} #VALDA`;
  fs.writeFileSync(path.join(dir,'Caption.txt'), cap+'\n');
  const notes=[`${p.arm} · ${p.parked?'Parked, not scheduled':p.day+' '+p.date+' 2026'}${p.note?' · '+p.note:''}`,
    `POST AT: ${timeFor(p,plat)}`,'',
    ...(plat==='Instagram'&&p.link?[`LINK: put ${p.link} in the bio link (or Linktree) for the week, and share the post to Stories with a link sticker.`,'']:[]),
    ...(p.video?[plat==='Instagram'?'REEL: upload Reel.mp4, pick a trending track at low volume, choose a cover frame with the title, and keep "Also share to feed" on.':'VIDEO: upload Reel.mp4 as a native video, not a link.','']:[]),
    'TAG (type @ and pick the official page or account; check the handle before posting):',
    ...(p.tag.length?p.tag.map(t=>'- '+t):['- none for this post']),
    ...(plat==='Instagram'?['',`LOCATION: ${p.loc||'none'}`,'','COLLABORATOR: invite the architect or developer as a Collab where you know their account, so the post shows on both profiles.']:(slides.length?['','DOCUMENT TITLE (carousel): '+strip(p.title)+' | VALDA']:[])),
    ...(alt.length?['','ALT TEXT (add per image for accessibility and search):',...alt]:[])].join('\n');
  fs.writeFileSync(path.join(dir,'Posting notes.txt'), notes+'\n');
}
const b=await chromium.launch();
// Posting times, US Eastern. Reels go out on Instagram in the evening slot.
const TIMES={LinkedIn:{Tue:'10:00 AM',Wed:'10:00 AM',Thu:'11:00 AM',Fri:'10:00 AM'},
 Instagram:{Tue:'12:00 PM',Wed:'12:00 PM',Thu:'12:00 PM',Fri:'11:00 AM'}};
const MON={Oct:10,Nov:11,Dec:12,Jan:'01',Feb:'02',Mar:'03'};
const folder=p=>p.parked?path.join('Parked',`${String(p.n).padStart(2,'0')} - ${p.title}`)
  :`${MON[p.date.slice(3)]}.${p.date.slice(0,2)} ${p.day} - ${String(p.n).padStart(2,'0')} ${p.title}`;
const timeFor=(p,plat)=>p.parked?'not scheduled':(plat==='Instagram'&&p.video?'6:00 PM':TIMES[plat][p.day])+' ET';
for (const p of POSTS) {
  const n=x=>(x.match(/#/g)||[]).length;
  if (n(p.ig)+1>5) throw new Error(`post ${p.n}: Instagram allows 5 hashtags, has ${n(p.ig)+1}`);
}
if (!only.length) for (const plat of ['Instagram','LinkedIn']) fs.rmSync(path.join(OUT,plat),{recursive:true,force:true});
for (const p of POSTS) {
  if (only.length && !only.includes(p.n)) continue;
  const name=folder(p);
  for (const [plat,fmt,h] of [['Instagram','ig',1350],['LinkedIn','sq',1080]]) {
    const dir=path.join(OUT,plat,name); fs.rmSync(dir,{recursive:true,force:true}); fs.mkdirSync(dir,{recursive:true});
    if (p.video) { fs.copyFileSync(path.join(OUT,'Extras',p.video),path.join(dir,'Reel.mp4')); writeText(p,plat,dir,[]); continue; }
    const page=await b.newPage({viewport:{width:1080,height:h}});
    await page.goto(`file://${path.resolve('render.html')}?n=${p.n}&fmt=${fmt}`);
    await page.evaluate(()=>document.fonts.ready); await page.waitForTimeout(500);
    const s=await page.$$('.slide');
    if (!s.length) throw new Error('no slides rendered for post '+p.n);
    for (let i=0;i<s.length;i++) await s[i].screenshot({path:path.join(dir,`Slide ${i+1}.png`)});
    if (plat==='Instagram' || s.length>1) execFileSync('convert',[...s.map((_,i)=>path.join(dir,`Slide ${i+1}.png`)),'-quality','88','-compress','jpeg','-density','72','-units','PixelsPerInch',path.join(dir,'Carousel.pdf')]);
    await page.close();
    writeText(p,plat,dir,p.slides);
  }
  console.log('built',name);
}
await b.close();
