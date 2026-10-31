// Turn a folder of "Slide N.png" files into Carousel.pdf (one 1080 x 1350 page per slide) for LinkedIn documents.
// node social/tools/extras-pdf.mjs "<folder>" ...
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'node:fs'; import path from 'node:path';
const b = await chromium.launch();
for (const dir of process.argv.slice(2)) {
  const abs = path.resolve(dir);
  const slides = fs.readdirSync(abs).filter(f => /^Slide \d+\.png$/.test(f)).sort((a, c) => parseInt(a.slice(6)) - parseInt(c.slice(6)));
  const html = `<style>@page{size:1080px 1350px;margin:0}*{margin:0}img{display:block;width:1080px;height:1350px;page-break-after:always}</style>` +
    slides.map(f => `<img src="${encodeURI(f)}">`).join('');
  const tmp = path.join(abs, '_pdf.html'); fs.writeFileSync(tmp, html);
  const p = await b.newPage(); await p.goto('file://' + tmp, { waitUntil: 'load' }); fs.rmSync(tmp);
  await p.pdf({ path: path.join(abs, 'Carousel.pdf'), width: '1080px', height: '1350px', printBackground: true, preferCSSPageSize: true });
  console.log(dir, slides.length);
}
await b.close();
