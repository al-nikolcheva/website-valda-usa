// Export every post into ../social-media: square (LinkedIn) + 4:5 portrait (Instagram).
// Usage: node export.mjs   (from the social/ folder)
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'node:fs'; import path from 'node:path';
const POSTS = [
  { n: 1, dir: 'educational-01', name: 'Aluminium or PVC' },
  { n: 2, dir: 'vista-guard-01', name: 'VALDA Vista' },
  { n: 3, dir: 'project-gora-01', name: 'GORA project' },
];
const OUT = path.resolve('../social-media');
const b = await chromium.launch();
for (const p of POSTS) {
  const root = path.join(OUT, `Post ${p.n} - ${p.name}`);
  for (const [fmt, h] of [['LinkedIn', 1080], ['Instagram', 1350]]) {
    const dir = path.join(root, fmt); fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
    const page = await b.newPage({ viewport: { width: 1080, height: h } });
    await page.goto('file://' + path.resolve(p.dir, 'carousel.html'));
    if (fmt === 'Instagram') await page.evaluate(() => document.body.classList.add('ig'));
    await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(600);
    const slides = await page.$$('.slide');
    for (let i = 0; i < slides.length; i++) await slides[i].screenshot({ path: path.join(dir, `Post ${p.n} - Slide ${i + 1}.png`) });
    if (fmt === 'LinkedIn') await page.pdf({ path: path.join(dir, `Post ${p.n} - LinkedIn carousel.pdf`), width: '1080px', height: '1080px', printBackground: true });
    await page.close();
  }
}
await b.close();
console.log('exported to', OUT);
