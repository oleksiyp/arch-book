// Render the share image from brand.html into assets/. (Favicons and app icons come from favicon.mjs.)
// Usage: serve the repo root on :8766 (python3 -m http.server 8766), then node brand.mjs
import puppeteer from 'puppeteer-core';

const OUT = {
  '#og': '../assets/og-banner.png',
};
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 2000, height: 1400, deviceScaleFactor: 1 });
await page.goto('http://localhost:8766/cover-lab/brand.html', { waitUntil: 'networkidle0' });
await page.waitForFunction('window.brandReady === true');
for (const [sel, path] of Object.entries(OUT)) {
  await (await page.$(sel)).screenshot({ path });
  console.log('wrote', path);
}
await browser.close();
