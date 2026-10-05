import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const p = await b.newPage({ viewport:{width:1080,height:1080}, deviceScaleFactor:1 });
await p.goto('file://'+process.cwd()+'/carousel.html'); await p.evaluate(()=>document.fonts.ready); await p.waitForTimeout(500);
const s = await p.$$('.slide');
for (let i=0;i<s.length;i++) await s[i].screenshot({path:`slide-0${i+1}.png`});
await p.pdf({path:'vista-guard-carousel.pdf',width:'1080px',height:'1080px',printBackground:true});
await b.close();
