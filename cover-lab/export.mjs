// Export a chosen cover as a self-contained SVG with all text converted to outlines.
// Usage: (serve this folder on :8765) node export.mjs [out.svg]
// The design and settings to export are in PICK below.
import puppeteer from 'puppeteer-core';
import { readFileSync, writeFileSync } from 'node:fs';

const PICK = { design: 'turing', cfg: { palette: 'paper', accents: 'both', weight: '4/2', plateStyle: 'boxed', plate: 'auto', font: 'archivo', spine: 0.55, seed: 1 } };
const OUT = process.argv[2] || '../assets/cover/wrap.svg';
const FS = 'https://cdn.jsdelivr.net/npm/@fontsource';
const FONT_FILES = {
  'Archivo|900|normal': `${FS}/archivo@5/files/archivo-latin-900-normal.woff`,
  'Archivo|700|normal': `${FS}/archivo@5/files/archivo-latin-700-normal.woff`,
  'Archivo|500|normal': `${FS}/archivo@5/files/archivo-latin-500-normal.woff`,
  'Source Serif 4|400|normal': `${FS}/source-serif-4@5/files/source-serif-4-latin-400-normal.woff`,
  'Source Serif 4|400|italic': `${FS}/source-serif-4@5/files/source-serif-4-latin-400-italic.woff`,
  'IBM Plex Mono|500|normal': `${FS}/ibm-plex-mono@5/files/ibm-plex-mono-latin-500-normal.woff`,
};

const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const page = await browser.newPage();
page.on('console', m => console.log('[page]', m.text()));
await page.goto('http://localhost:8765/index.html', { waitUntil: 'networkidle0' });
await page.addScriptTag({ content: readFileSync(new URL('./node_modules/opentype.js/dist/opentype.min.js', import.meta.url), 'utf8') });
const svg = await page.evaluate(async (pick, files) => {
  const fonts = {};
  for (const [k, url] of Object.entries(files)) fonts[k] = opentype.parse(await (await fetch(url)).arrayBuffer());
  const d = Lab.designs.find(x => x.id === pick.design);
  const r = await Lab.build(d, pick.cfg, true);
  const g = r.geo;
  const host = document.createElement('div');
  host.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${g.W} ${g.H}" width="${g.W / 100}in" height="${g.H / 100}in">${r.markup}</svg>`;
  document.body.appendChild(host);
  const root = host.firstElementChild;
  const missing = new Set();
  for (const t of [...root.querySelectorAll('text')]) {
    const cs = getComputedStyle(t);
    const fam = cs.fontFamily.split(',')[0].replace(/["']/g, '').trim();
    const key = `${fam}|${cs.fontWeight}|${cs.fontStyle}`;
    const font = fonts[key];
    if (!font) { missing.add(key); continue; }
    const size = parseFloat(t.getAttribute('font-size'));
    const str = t.textContent;
    let dd = '';
    for (let i = 0; i < str.length; i++) {
      if (str[i] === ' ') continue;
      const p = t.getStartPositionOfChar(i);
      dd += font.charToGlyph(str[i]).getPath(p.x, p.y, size).toPathData(2);
    }
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', dd);
    path.setAttribute('fill', t.getAttribute('fill') || cs.fill);
    t.replaceWith(path);
  }
  if (missing.size) throw new Error('No font file for: ' + [...missing].join(', '));
  return { svg: root.outerHTML, geo: g };
}, PICK, FONT_FILES);
writeFileSync(OUT, `<?xml version="1.0" encoding="UTF-8"?>\n<!-- ${PICK.design} seed ${PICK.cfg.seed}, spine ${PICK.cfg.spine} in; wrap ${svg.geo.W / 100} x ${svg.geo.H / 100} in incl. 0.125 in bleed; back ${JSON.stringify(svg.geo.back)} spine ${JSON.stringify(svg.geo.spine)} front ${JSON.stringify(svg.geo.front)} (units 0.01 in) -->\n` + svg.svg);
console.log('wrote', OUT, Math.round(svg.svg.length / 1024) + 'KB', JSON.stringify(svg.geo));
await browser.close();
