// Render an HTML reel (window.render(t), window.DURATION) to a 1080x1920 MP4.
// Usage: node render.mjs thermal-break.html "../../social-media/Extras/Reel - Thermal break.mp4"
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'node:fs'; import path from 'node:path'; import { execFileSync } from 'node:child_process';
const [src,out]=process.argv.slice(2); const FPS=30;
const tmp=fs.mkdtempSync('/tmp/reel-'); const b=await chromium.launch();
const p=await b.newPage({viewport:{width:1080,height:1920}});
await p.goto('file://'+path.resolve(src)); await p.evaluate(()=>document.fonts.ready);
const D=await p.evaluate('window.DURATION'); const N=Math.round(D*FPS);
for(let i=0;i<N;i++){await p.evaluate(t=>window.render(t),i/FPS);await p.screenshot({path:`${tmp}/f${String(i).padStart(4,'0')}.png`});}
await b.close();
execFileSync('ffmpeg',['-v','error','-y','-framerate',String(FPS),'-i',`${tmp}/f%04d.png`,'-c:v','libx264','-pix_fmt','yuv420p','-crf','20','-movflags','+faststart',out]);
fs.rmSync(tmp,{recursive:true}); console.log('wrote',out,N,'frames');
