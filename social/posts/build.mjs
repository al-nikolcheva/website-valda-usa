// Build every post into ../../social-media/{Instagram,LinkedIn}/NN - DD Mon - Title/
// Usage: node build.mjs [n ...]   (no args = all posts)
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'node:fs'; import path from 'node:path'; import vm from 'node:vm';
const ctx={window:{}}; vm.runInNewContext(fs.readFileSync('posts.js','utf8'),ctx);
const POSTS=ctx.window.POSTS, only=process.argv.slice(2).map(Number);
const OUT=path.resolve('../../social-media');
const TAGS={Educational:'#VALDA #windows #glazing #architecture #architects #buildingdesign #windowdesign #specification',
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
    if (plat==='LinkedIn' && s.length>1) await page.pdf({path:path.join(dir,'Carousel.pdf'),width:'1080px',height:'1080px',printBackground:true});
    await page.close();
    const head=`${p.arm} · ${p.day} ${p.date}${p.note?' · '+p.note:''}\n\n`;
    const cap = plat==='LinkedIn' ? `${p.caption}\n\nvaldagroup.com` : `${p.caption}\n\nLink in bio.\n\n${TAGS[p.arm]}`;
    fs.writeFileSync(path.join(dir,'Caption.txt'), cap+'\n');
  }
  console.log('built',name);
}
await b.close();
