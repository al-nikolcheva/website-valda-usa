import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'node:fs';
fs.mkdirSync('out',{recursive:true});
const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1080,height:1350}});
await p.goto('file://'+process.cwd()+'/covers.html'); await p.evaluate(()=>document.fonts.ready); await p.waitForTimeout(800);
const s=await p.$$('.slide'); for(let i=0;i<s.length;i++) await s[i].screenshot({path:`out/${String(i+1).padStart(2,'0')}.png`});
await b.close();
