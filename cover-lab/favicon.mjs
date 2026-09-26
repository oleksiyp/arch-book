// Export the chosen favicon from favicon.html to assets/icons (64 px primary, 32 px fallback).
// Usage: serve the repo root on :8766, then node favicon.mjs
import puppeteer from 'puppeteer-core';
import { writeFileSync } from 'node:fs';

const CHOSEN = { style: 'blueprint', front: 18 };
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const page = await browser.newPage();
await page.goto('http://localhost:8766/cover-lab/favicon.html', { waitUntil: 'networkidle0' });
await page.waitForFunction('typeof window.renderFavicon === "function"');
const out = await page.evaluate(o => window.renderFavicon(o), CHOSEN);
for (const [key, file] of [['png64', '../assets/icons/favicon-64.png'], ['png32', '../assets/icons/favicon-32.png']]) {
  writeFileSync(file, Buffer.from(out[key].split(',')[1], 'base64'));
  console.log('wrote', file);
}
await browser.close();
