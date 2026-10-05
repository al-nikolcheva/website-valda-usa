// Build every post into ../../social-media/{Instagram,LinkedIn}/NN - DD Mon - Title/
// Usage: node build.mjs [n ...]   (no args = all posts)
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'node:fs'; import { execFileSync } from 'node:child_process'; import path from 'node:path'; import vm from 'node:vm';
const ctx={window:{}}; vm.runInNewContext(fs.readFileSync('posts.js','utf8'),ctx);
const POSTS=ctx.window.POSTS, only=process.argv.slice(2).map(Number);
const OUT=path.resolve('../../social-media');
const _UNUSED_TAGS={Educational:'#VALDA #windows #glazing #architecture #architects #buildingdesign #windowdesign #specification',
 'What we have':'#VALDA #windows #aluminiumwindows #impactwindows #facade #architecture #architects #windowdesign',
 Projects:'#VALDA #architecture #residentialarchitecture #glazing #windows #facade #projectshowcase #architects'};
const b=await chromium.launch();
for (const p of POSTS) {
  if (only.length && !only.includes(p.n)) continue;
  const name=`${String(p.n).padStart(2,'0')} - ${p.day} ${p.date} - ${p.title}`;
  for (const [plat,fmt,h] of [['Instagram','ig',1350],['LinkedIn','sq',1080]]) {
    const dir=path.join(OUT,plat,name); fs.rmSync(dir,{recursive:true,force:true}); fs.mkdirSync(dir,{recursive:true});
    const page=await b.newPage({viewport:{width:1080,height:h}});
    await page.goto(`file://${path.resolve('render.html')}?n=${p.n}&fmt=${fmt}`);
    await page.evaluate(()=>document.fonts.ready); await page.waitForTimeout(500);
    const s=await page.$$('.slide');
    if (!s.length) throw new Error('no slides rendered for post '+p.n);
    for (let i=0;i<s.length;i++) await s[i].screenshot({path:path.join(dir,`Slide ${i+1}.png`)});
    if (plat==='Instagram' || s.length>1) execFileSync('convert',[...s.map((_,i)=>path.join(dir,`Slide ${i+1}.png`)),'-quality','88','-compress','jpeg','-density','72','-units','PixelsPerInch',path.join(dir,'Carousel.pdf')]);
    await page.close();
    const strip=t=>String(t||'').replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();
    const kind=x=>({photo:'Photo of ',photoType:'Photo of ',card:'Photo of ',photoSlide:'Photo: ',inSitu:'Photo: ',over:'Photo with text: ',systems:'Drawing of a window with text: ',drawing:'Drawing of a window with text: ',sand:'Window profile section with text: ',darkCut:'Window profile section with text: ',section:'Window profile section with text: '}[x.t]||'Text slide: ');
    const alt=p.slides.map((x,i)=>`Slide ${i+1}: ${kind(x)}${[x.label,x.h,x.d||x.lead||x.cap,x.c].map(strip).filter(Boolean).join('. ')}`.replace(/\.\./g,'.'));
    const cap = plat==='LinkedIn'
      ? `${p.caption}\n\n${p.li} #VALDA\n\nvaldagroup.com`
      : `${p.caption}\n\nLink in bio.\n\n#VALDA #VALDAgroup ${p.ig}`;
    fs.writeFileSync(path.join(dir,'Caption.txt'), cap+'\n');
    const notes=[`${p.arm} · ${p.day} ${p.date}${p.note?' · '+p.note:''}`,'',
      'TAG (type @ and pick the official page or account; check the handle before posting):',
      ...(p.tag.length?p.tag.map(t=>'- '+t):['- none for this post']),
      ...(plat==='Instagram'?['',`LOCATION: ${p.loc||'none'}`,'','COLLABORATOR: invite the architect or developer as a Collab where you know their account, so the post shows on both profiles.']:['','DOCUMENT TITLE (carousel): '+strip(p.slides[0].h)]),
      '','ALT TEXT (add per image for accessibility and search):',...alt].join('\n');
    fs.writeFileSync(path.join(dir,'Posting notes.txt'), notes+'\n');
  }
  console.log('built',name);
}
await b.close();
