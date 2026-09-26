// Export the chosen favicon from favicon.html to assets/icons: 64/32 px favicons plus the iOS and Android app icons.
// Usage: serve the repo root on :8766, then node favicon.mjs
import puppeteer from 'puppeteer-core';
import { writeFileSync } from 'node:fs';

const CHOSEN = { style: 'blueprint', center: [29, 41], r: 8 };
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const page = await browser.newPage();
await page.goto('http://localhost:8766/cover-lab/favicon.html', { waitUntil: 'networkidle0' });
await page.waitForFunction('typeof window.renderFavicon === "function"');
const out = await page.evaluate(o => window.renderFavicon(o), CHOSEN);
const save = (file, url) => { writeFileSync(file, Buffer.from(url.split(',')[1], 'base64')); console.log('wrote', file); };
save('../assets/icons/favicon-64.png', out.png64);
save('../assets/icons/favicon-32.png', out.png32);
// App icons. The book spans 60/64 of the SVG's height, so `scale` sets how much of the square it fills.
const PAPER = '#f3f1ec';
const APP = [
  ['../assets/icons/apple-touch-icon.png', 180, 0.86, PAPER],     // iOS: must be opaque; iOS rounds the corners
  ['../assets/icons/icon-192.png', 192, 1, null],                // manifest "any": the book itself
  ['../assets/icons/icon-512.png', 512, 1, null],
  ['../assets/icons/icon-512-maskable.png', 512, 0.68, PAPER],   // manifest "maskable": inside the 80% safe circle
];
for (const [file, size, scale, bg] of APP) save(file, await page.evaluate((o, n, k, b) => window.renderIcon(o, n, k, b), CHOSEN, size, scale, bg));
await browser.close();
