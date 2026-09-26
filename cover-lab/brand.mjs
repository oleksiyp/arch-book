// Render the share image and app icons from brand.html into assets/.
// Usage: serve the repo root on :8766 (python3 -m http.server 8766), then node brand.mjs
import puppeteer from 'puppeteer-core';

const OUT = {
  '#og': '../assets/og-banner.png',
  '#icon-512': '../assets/icons/icon-512.png',
  '#icon-192': '../assets/icons/icon-192.png',
  '#icon-180': '../assets/icons/apple-touch-icon.png',
  '#icon-32': '../assets/icons/favicon-32.png',
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
