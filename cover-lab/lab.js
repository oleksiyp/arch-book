'use strict';
// Cover Lab core: geometry, palettes, drawing helpers, typography, rendering queue.
// Units: 1 unit = 0.01 in. Trim 6 x 9 in = 600 x 900 units. Designs draw the full wrap.
const Lab = (() => {
  const designs = [];
  const register = d => designs.push(d);

  // ---------- numbers, rng, noise
  const f1 = n => Math.round(n * 10) / 10;
  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function makeRng(seed) {
    const r = mulberry32((seed * 2654435761) >>> 0);
    for (let i = 0; i < 8; i++) r();
    return {
      next: r,
      range: (a, b) => a + (b - a) * r(),
      int: (a, b) => a + Math.floor((b - a + 1) * r()),
      pick: arr => arr[Math.floor(r() * arr.length)],
      chance: p => r() < p,
      gauss() { let u = 0, v = 0; while (!u) u = r(); while (!v) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); },
      shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; },
    };
  }
  function makeNoise(rng) {
    const perm = [...Array(256).keys()];
    rng.shuffle(perm);
    const p = new Uint8Array(512);
    for (let i = 0; i < 512; i++) p[i] = perm[i & 255];
    const gx = new Float64Array(256), gy = new Float64Array(256);
    for (let i = 0; i < 256; i++) { const a = i / 256 * Math.PI * 2; gx[i] = Math.cos(a); gy[i] = Math.sin(a); }
    const fade = t => t * t * t * (t * (t * 6 - 15) + 10);
    function n2(x, y) {
      const X = Math.floor(x), Y = Math.floor(y), xf = x - X, yf = y - Y, xi = X & 255, yi = Y & 255;
      const g = (h, dx, dy) => gx[h] * dx + gy[h] * dy;
      const aa = p[p[xi] + yi], ab = p[p[xi] + yi + 1], ba = p[p[xi + 1] + yi], bb = p[p[xi + 1] + yi + 1];
      const u = fade(xf), v = fade(yf);
      const x1 = g(aa, xf, yf) + (g(ba, xf - 1, yf) - g(aa, xf, yf)) * u;
      const x2 = g(ab, xf, yf - 1) + (g(bb, xf - 1, yf - 1) - g(ab, xf, yf - 1)) * u;
      return (x1 + (x2 - x1) * v) * 1.41;
    }
    function fbm(x, y, oct = 4) {
      let s = 0, a = 1, f = 1, n = 0;
      for (let i = 0; i < oct; i++) { s += a * n2(x * f + i * 17.3, y * f - i * 9.1); n += a; a *= 0.5; f *= 2.03; }
      return s / n;
    }
    return { n2, fbm };
  }
  const yieldFrame = () => new Promise(r => setTimeout(r, 0));

  // ---------- colors
  function hex2rgb(h) { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
  function mix(a, b, t) {
    const A = hex2rgb(a), B = hex2rgb(b);
    return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('');
  }
  const PALETTES = {
    paper: { label: 'Paper', ground: '#F6F4EF', line: '#FFFFFF', ink: '#111318', plate: '#FFFFFF', plateText: '#111318', text: '#111318', a: '#F38B1C', b: '#00C9FF' },
    navy: { label: 'Navy', ground: '#1B1F3B', line: '#F4F2EC', ink: '#07091A', plate: '#F4F2EC', plateText: '#1B1F3B', text: '#F4F2EC', a: '#F38B1C', b: '#00C9FF' },
    ink: { label: 'Ink', ground: '#15161A', line: '#EFECE5', ink: '#000000', plate: '#15161A', plateText: '#EFECE5', text: '#EFECE5', a: '#F38B1C', b: '#00C9FF' },
    signal: { label: 'Signal orange', ground: '#F38B1C', line: '#FFFFFF', ink: '#1B1F3B', plate: '#FFFFFF', plateText: '#1B1F3B', text: '#1B1F3B', a: '#1B1F3B', b: '#00C9FF' },
    sky: { label: 'Sky', ground: '#00C9FF', line: '#FFFFFF', ink: '#1B1F3B', plate: '#FFFFFF', plateText: '#1B1F3B', text: '#1B1F3B', a: '#F38B1C', b: '#1B1F3B' },
  };
  const ACCENTS = { both: 'Orange + cyan', a: 'First only', b: 'Second only', none: 'Black & white' };
  const WEIGHTS = { '4/2': [4, 2], '6/2': [6, 2], '8/3': [8, 3], '3/1.5': [3, 1.5] };

  // ---------- fonts & text
  const FONTS = {
    archivo: { label: 'Archivo', display: 'Archivo', w1: 900, w2: 500, cap: 0.72, max: 130 },
    opensans: { label: 'Open Sans (site)', display: 'Open Sans', w1: 800, w2: 400, cap: 0.72, max: 130 },
    shoulders: { label: 'Big Shoulders', display: 'Big Shoulders Display', w1: 900, w2: 600, cap: 0.74, max: 118 },
    serif: { label: 'Source Serif', display: 'Source Serif 4', w1: 700, w2: 400, cap: 0.67, max: 130 },
  };
  const SERIF = 'Source Serif 4', MONO = 'IBM Plex Mono';
  const TEXT = {
    t1: 'SOFTWARE', t2: 'ARCHITECTURE', t3: 'in the AI & Cloud Era',
    sub: 'The road to platform architecture',
    author: 'OLEKSIY PYLYPENKO', authorShort: 'PYLYPENKO',
    hook: 'Code has never been cheaper to produce, and coherence has never been more expensive.',
    p1: 'The tools of our era generate implementations faster than any of us can type, and in doing so they quietly raise the price of the one thing they cannot generate: judgment. Which trade-off, for which quality, at what cost, written down where the next person can find it.',
    p2: 'Fifteen chapters take you from the first sketch to a company-wide platform: architecture styles, domain-driven design, distributed systems, events and streaming, APIs, data mesh, zero trust, cloud-native operations, AI systems with LLMs, RAG and agents, the economics of buy versus build, multi-tenant SaaS and platform engineering.',
    foot: 'oleksiyp.github.io/arch-book',
  };
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const mc = document.createElement('canvas').getContext('2d');
  function measure(text, weight, fam, size, style = 'normal') {
    mc.font = `${style} ${weight} ${size}px "${fam}", sans-serif`;
    return mc.measureText(text).width;
  }
  function wrapText(text, width, weight, fam, size, style) {
    const words = text.split(' '), lines = []; let cur = '';
    for (const w of words) {
      const t = cur ? cur + ' ' + w : w;
      if (measure(t, weight, fam, size, style) > width && cur) { lines.push(cur); cur = w; } else cur = t;
    }
    if (cur) lines.push(cur);
    return lines;
  }
  const fontsReady = (async () => {
    const faces = ['900 40px "Archivo"', '500 40px "Archivo"', '700 40px "Archivo"', '800 40px "Open Sans"', '400 40px "Open Sans"',
      '900 40px "Big Shoulders Display"', '600 40px "Big Shoulders Display"', '700 40px "Source Serif 4"', '400 40px "Source Serif 4"',
      'italic 400 40px "Source Serif 4"', '500 40px "IBM Plex Mono"'];
    try { await Promise.race([Promise.all(faces.map(f => document.fonts.load(f))), new Promise(r => setTimeout(r, 4000))]); } catch (e) { /* fall back */ }
  })();

  // ---------- geometry
  const B = 12.5, TW = 600, TH = 900;
  function geometry(spineIn) {
    const S = Math.round(spineIn * 100);
    const W = B * 2 + TW * 2 + S, H = B * 2 + TH;
    const back = { x: B, y: B, w: TW, h: TH }, spine = { x: B + TW, y: B, w: S, h: TH }, front = { x: B + TW + S, y: B, w: TW, h: TH };
    return { W, H, B, S, back, spine, front };
  }

  // ---------- paths
  const pt = p => f1(p[0]) + ' ' + f1(p[1]);
  const pathL = (pts, closed) => pts.length ? 'M' + pts.map(pt).join('L') + (closed ? 'Z' : '') : '';
  function smooth(pts, closed) {
    const n = pts.length; if (n < 3) return pathL(pts, closed);
    const P = i => closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))];
    let d = 'M' + pt(pts[0]);
    const m = closed ? n : n - 1;
    for (let i = 0; i < m; i++) {
      const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
      d += 'C' + pt([p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]) + ' ' +
        pt([p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]) + ' ' + pt(p2);
    }
    return d + (closed ? 'Z' : '');
  }
  function rounded(pts, r) {
    if (pts.length < 3) return pathL(pts);
    let d = 'M' + pt(pts[0]);
    for (let i = 1; i < pts.length - 1; i++) {
      const a = pts[i - 1], b = pts[i], c = pts[i + 1];
      const l1 = Math.hypot(b[0] - a[0], b[1] - a[1]), l2 = Math.hypot(c[0] - b[0], c[1] - b[1]);
      if (!l1 || !l2) continue;
      const rr = Math.min(r, l1 / 2, l2 / 2);
      d += 'L' + pt([b[0] + (a[0] - b[0]) / l1 * rr, b[1] + (a[1] - b[1]) / l1 * rr]) +
        'Q' + pt(b) + ' ' + pt([b[0] + (c[0] - b[0]) / l2 * rr, b[1] + (c[1] - b[1]) / l2 * rr]);
    }
    return d + 'L' + pt(pts[pts.length - 1]);
  }
  function offsetPolyline(pts, dist) {
    const out = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[i], c = pts[Math.min(pts.length - 1, i + 1)];
      const n1 = normal(i === 0 ? b : a, i === 0 ? c : b), n2 = normal(i === pts.length - 1 ? a : b, i === pts.length - 1 ? b : c);
      let mx = n1[0] + n2[0], my = n1[1] + n2[1]; const ml = Math.hypot(mx, my) || 1; mx /= ml; my /= ml;
      const k = Math.min(3, 1 / Math.max(0.3, mx * n1[0] + my * n1[1]));
      out.push([b[0] + mx * dist * k, b[1] + my * dist * k]);
    }
    return out;
  }
  function normal(a, b) { const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; return [-dy / l, dx / l]; }
  function runs(pts, fn) {
    const out = []; let cur = null;
    for (const p of pts) {
      const v = fn(p[0], p[1]);
      if (!cur) { cur = { v, pts: [p] }; out.push(cur); }
      else if (cur.v !== v) { const last = cur.pts[cur.pts.length - 1]; cur = { v, pts: [last, p] }; out.push(cur); }
      else cur.pts.push(p);
    }
    return out;
  }
  function pointInPoly(x, y, poly) {
    let c = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, yi] = poly[i], [xj, yj] = poly[j];
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c;
    }
    return c;
  }

  // Marching squares over a scalar grid. Returns polylines [{pts, closed}] in canvas units.
  function contours(field, gw, gh, cs, level, ox = 0, oy = 0) {
    const segA = [], segB = [], pos = new Map();
    const idx = (i, j) => j * gw + i;
    const hKey = (i, j) => j * gw + i, vKey = (i, j) => gw * gh + j * gw + i;
    const lerpP = (x0, y0, v0, x1, y1, v1) => { const t = (level - v0) / (v1 - v0); return [ox + (x0 + (x1 - x0) * t) * cs, oy + (y0 + (y1 - y0) * t) * cs]; };
    for (let j = 0; j < gh - 1; j++) for (let i = 0; i < gw - 1; i++) {
      const tl = field[idx(i, j)], tr = field[idx(i + 1, j)], br = field[idx(i + 1, j + 1)], bl = field[idx(i, j + 1)];
      const c = (tl > level ? 8 : 0) | (tr > level ? 4 : 0) | (br > level ? 2 : 0) | (bl > level ? 1 : 0);
      if (c === 0 || c === 15) continue;
      const E = {
        T: () => { const k = hKey(i, j); if (!pos.has(k)) pos.set(k, lerpP(i, j, tl, i + 1, j, tr)); return k; },
        B: () => { const k = hKey(i, j + 1); if (!pos.has(k)) pos.set(k, lerpP(i, j + 1, bl, i + 1, j + 1, br)); return k; },
        L: () => { const k = vKey(i, j); if (!pos.has(k)) pos.set(k, lerpP(i, j, tl, i, j + 1, bl)); return k; },
        R: () => { const k = vKey(i + 1, j); if (!pos.has(k)) pos.set(k, lerpP(i + 1, j, tr, i + 1, j + 1, br)); return k; },
      };
      const add = (a, b) => { segA.push(E[a]()); segB.push(E[b]()); };
      const center = (tl + tr + br + bl) / 4 > level;
      switch (c) {
        case 1: add('L', 'B'); break; case 2: add('B', 'R'); break; case 3: add('L', 'R'); break;
        case 4: add('T', 'R'); break; case 6: add('T', 'B'); break; case 7: add('T', 'L'); break;
        case 8: add('T', 'L'); break; case 9: add('T', 'B'); break; case 11: add('T', 'R'); break;
        case 12: add('L', 'R'); break; case 13: add('B', 'R'); break; case 14: add('L', 'B'); break;
        case 5: if (center) { add('T', 'L'); add('B', 'R'); } else { add('T', 'R'); add('L', 'B'); } break;
        case 10: if (center) { add('T', 'R'); add('L', 'B'); } else { add('T', 'L'); add('B', 'R'); } break;
      }
    }
    const adj = new Map();
    const link = (k, s) => { const l = adj.get(k); if (l) l.push(s); else adj.set(k, [s]); };
    for (let s = 0; s < segA.length; s++) { link(segA[s], s); link(segB[s], s); }
    const used = new Uint8Array(segA.length), out = [];
    const walk = (s, from) => {
      const keys = [from];
      let k = from;
      while (true) {
        used[s] = 1;
        const nk = segA[s] === k ? segB[s] : segA[s];
        keys.push(nk); k = nk;
        const nxt = (adj.get(k) || []).find(t => !used[t]);
        if (nxt === undefined) break;
        s = nxt;
      }
      return keys;
    };
    // open chains first (endpoints with a single segment), then loops
    for (const [k, l] of adj) if (l.length === 1 && !used[l[0]]) out.push({ pts: walk(l[0], k).map(q => pos.get(q)), closed: false });
    for (let s = 0; s < segA.length; s++) if (!used[s]) {
      const keys = walk(s, segA[s]);
      out.push({ pts: keys.slice(0, -1).map(q => pos.get(q)), closed: keys[0] === keys[keys.length - 1] });
    }
    return out;
  }

  // ---------- context for designs
  function makeCtx(design, cfg, geo, reserved) {
    const rng = makeRng(cfg.seed * 7919 + design.id.length * 31 + design.id.charCodeAt(0));
    const noise = makeNoise(rng);
    const pal = PALETTES[cfg.palette] || PALETTES.paper;
    const accents = { both: [pal.a, pal.b], a: [pal.a], b: [pal.b], none: [] }[cfg.accents] || [pal.a, pal.b];
    const [lw, bw] = WEIGHTS[cfg.weight] || WEIGHTS['4/2'];
    const margin = cfg.plateStyle === 'clear' ? 14 : 6;
    const uid = 'u' + Math.random().toString(36).slice(2, 8);
    const ctx = { ...geo, cfg, rng, noise, pal, accents, lw, bw, reserved, uid, f1, mix, pathL, smooth, rounded, offsetPolyline, runs, contours, pointInPoly, yieldFrame, esc };
    ctx.inBounds = (x, y, pad = 0) => x >= -pad && y >= -pad && x <= geo.W + pad && y <= geo.H + pad;
    ctx.free = (x, y, pad = 0) => {
      for (const r of reserved) {
        const m = pad + margin;
        if (x > r.x - m && x < r.x + r.w + m && y > r.y - m && y < r.y + r.h + m) return false;
      }
      return true;
    };
    ctx.accent = i => accents.length ? accents[((i % accents.length) + accents.length) % accents.length] : null;
    // Colour zones: a few noise-warped blobs where lines come alive in the accent colours.
    const zones = [];
    if (accents.length) {
      const spots = [
        [geo.front.x + rng.range(0.2, 0.8) * TW, geo.front.y + rng.range(0.45, 0.85) * TH, rng.range(110, 190)],
        [geo.back.x + rng.range(0.2, 0.8) * TW, geo.back.y + rng.range(0.55, 0.9) * TH, rng.range(80, 150)],
        [geo.spine.x + geo.S / 2 + rng.range(-120, 120), geo.front.y + rng.range(0.1, 0.4) * TH, rng.range(60, 120)],
      ];
      if (rng.chance(0.6)) spots.push([geo.front.x + rng.range(0.1, 0.9) * TW, geo.front.y + rng.range(0.15, 0.95) * TH, rng.range(40, 90)]);
      spots.forEach(([x, y, r], i) => {
        const poly = [];
        for (let k = 0; k < 64; k++) {
          const a = k / 64 * Math.PI * 2;
          const rr = r * (1 + 0.45 * noise.fbm(Math.cos(a) * 1.3 + i * 7, Math.sin(a) * 1.3 + i * 3, 3));
          poly.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]);
        }
        zones.push({ poly, color: accents[i % accents.length], x, y, r });
      });
    }
    ctx.zones = zones;
    ctx.zone = (x, y) => { for (const z of zones) if (pointInPoly(x, y, z.poly)) return z.color; return null; };
    // A line (polyline) that changes colour where it passes through a zone.
    ctx.line = (pts, o = {}) => {
      const mk = o.smooth === false ? pathL : smooth;
      if (o.color !== undefined || !zones.length) return [{ d: mk(pts, o.closed), color: o.color ?? null, w: o.w }];
      const p = o.closed ? [...pts, pts[0]] : pts;
      const rs = runs(p, ctx.zone);
      if (rs.length === 1) return [{ d: mk(pts, o.closed), color: rs[0].v, w: o.w }];
      return rs.map(r => ({ d: mk(r.pts, false), color: r.v, w: o.w }));
    };
    // Cased strokes: every casing (black, lw + 2*bw) first, then every fill, so touching borders fuse.
    ctx.cased = (strokes, o = {}) => {
      const cap = o.cap || 'round', join = o.join || 'round';
      const byW = new Map(), byCW = new Map();
      for (const s of strokes) {
        const w = s.w ?? lw;
        (byW.get(w) || byW.set(w, []).get(w)).push(s.d);
        const k = (s.color || pal.line) + '|' + w;
        (byCW.get(k) || byCW.set(k, []).get(k)).push(s.d);
      }
      let out = `<g fill="none" stroke="${pal.ink}" stroke-linecap="${cap}" stroke-linejoin="${join}">`;
      for (const [w, ds] of [...byW].sort((a, b) => a[0] - b[0])) out += `<path stroke-width="${w + 2 * bw}" d="${ds.join('')}"/>`;
      out += `</g><g fill="none" stroke-linecap="${cap}" stroke-linejoin="${join}">`;
      const keys = [...byCW.keys()].sort((a, b) => (b.startsWith(pal.line + '|') ? 1 : 0) - (a.startsWith(pal.line + '|') ? 1 : 0));
      for (const k of keys) { const [c, w] = k.split('|'); out += `<path stroke="${c}" stroke-width="${w}" d="${byCW.get(k).join('')}"/>`; }
      return out + '</g>';
    };
    ctx.dot = (x, y, r, fill) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r + bw)}" fill="${pal.ink}"/><circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="${fill || pal.line}"/>`;
    return ctx;
  }

  // ---------- typography layers
  function frontLayout(font, w) {
    const F = FONTS[font] || FONTS.archivo, p = 28, iw = w - 2 * p;
    const m = (t, wt) => measure(t, wt, F.display, 100) / 100;
    let s1 = iw / m(TEXT.t1, F.w1), s2 = iw / m(TEXT.t2, F.w1);
    const fit1 = s1 <= F.max, fit2 = s2 <= F.max;
    s1 = Math.min(s1, F.max); s2 = Math.min(s2, F.max * 0.8);
    const s3 = Math.min(iw / m(TEXT.t3, F.w2), s2 * 0.62);
    let y = p;
    const b1 = y += F.cap * s1;
    const b2 = y += 0.14 * s2 + F.cap * s2;
    const b3 = y += 0.3 * s3 + 0.74 * s3;
    const rule = y += 20;
    const b4 = y += 16 + 19 * 0.72;
    const b5 = y += 34;
    const h = y + p - 6;
    return {
      h,
      draw(x, y0, color, accent, ink) {
        const t = (txt, bx, by, size, wt, fam, extra = '') => `<text x="${f1(x + bx)}" y="${f1(y0 + by)}" font-family="'${fam}'" font-size="${f1(size)}" font-weight="${wt}" fill="${color}" ${extra}>${esc(txt)}</text>`;
        return t(TEXT.t1, p, b1, s1, F.w1, F.display, fit1 ? `textLength="${iw}" lengthAdjust="spacing"` : '') +
          t(TEXT.t2, p, b2, s2, F.w1, F.display, fit2 ? `textLength="${iw}" lengthAdjust="spacing"` : '') +
          t(TEXT.t3, p, b3, s3, F.w2, F.display) +
          `<path d="M${f1(x + p)} ${f1(y0 + rule)}h${iw}" stroke="${accent || ink}" stroke-width="${accent ? 5 : 2}"/>` +
          t(TEXT.sub, p, b4, 19, 400, SERIF, 'font-style="italic"') +
          t(TEXT.author, p, b5, 13.5, 500, MONO, 'letter-spacing="2.6"');
      },
    };
  }
  function backLayout(w) {
    const p = 26, iw = w - 2 * p;
    const hook = wrapText(TEXT.hook, iw, 700, 'Archivo', 23);
    const p1 = wrapText(TEXT.p1, iw, 400, SERIF, 14.2), p2 = wrapText(TEXT.p2, iw, 400, SERIF, 14.2);
    let y = p; const items = [];
    for (const l of hook) { y += 27; items.push(['h', l, y]); }
    y += 10;
    for (const l of p1) { y += 21; items.push(['p', l, y]); }
    y += 10;
    for (const l of p2) { y += 21; items.push(['p', l, y]); }
    y += 32; items.push(['f', TEXT.foot, y]);
    return {
      h: y + p - 6,
      draw(x, y0, color) {
        return items.map(([k, l, by]) => {
          const [fam, size, wt, extra] = k === 'h' ? ['Archivo', 23, 700, ''] : k === 'p' ? [SERIF, 14.2, 400, ''] : [MONO, 11, 500, 'letter-spacing="1.2"'];
          return `<text x="${f1(x + p)}" y="${f1(y0 + by)}" font-family="'${fam}'" font-size="${size}" font-weight="${wt}" fill="${color}" ${extra}>${esc(l)}</text>`;
        }).join('');
      },
    };
  }

  function plateLayout(cfg, geo, design) {
    const pos = cfg.plate === 'auto' ? (design.plate || 'top') : cfg.plate;
    const fl = frontLayout(cfg.font, 528);
    const fy = pos === 'bottom' ? geo.front.y + TH - 46 - fl.h : pos === 'middle' ? geo.front.y + (TH - fl.h) / 2 : geo.front.y + 46;
    const front = { x: geo.front.x + 36, y: fy, w: 528, h: fl.h };
    const bl = backLayout(512);
    const back = { x: geo.back.x + 44, y: geo.back.y + 56, w: 512, h: bl.h };
    const barcode = { x: geo.back.x + TW - 44 - 190, y: geo.back.y + TH - 50 - 110, w: 190, h: 110 };
    const spine = geo.S >= 30 ? { x: geo.spine.x + Math.min(10, geo.S * 0.12), y: geo.spine.y + 34, w: geo.S - 2 * Math.min(10, geo.S * 0.12), h: TH - 68 } : null;
    const reserved = [front, back, barcode]; if (spine) reserved.push(spine);
    return { pos, front, back, barcode, spine, fl, bl, reserved };
  }

  function drawType(ctx, L) {
    const { pal, lw, bw, cfg } = ctx;
    const style = cfg.plateStyle;
    const acc = ctx.accents[0] || null;
    const boxed = style !== 'clear';
    const textCol = boxed ? pal.plateText : pal.text;
    const frame = r => {
      if (!boxed) return '';
      const rr = 6;
      const shape = `x="${f1(r.x)}" y="${f1(r.y)}" width="${f1(r.w)}" height="${f1(r.h)}" rx="${rr}"`;
      return `<rect ${shape} fill="${pal.plate}"/><rect ${shape} fill="none" stroke="${pal.ink}" stroke-width="${lw + 2 * bw}"/><rect ${shape} fill="none" stroke="${pal.line}" stroke-width="${lw}"/>`;
    };
    let out = '';
    if (style === 'band') {
      const r = L.front, x0 = ctx.front.x, x1 = ctx.W;
      out += `<rect x="${f1(x0)}" y="${f1(r.y)}" width="${f1(x1 - x0)}" height="${f1(r.h)}" fill="${pal.plate}"/>`;
      out += ctx.cased([{ d: `M${f1(x0)} ${f1(r.y)}H${f1(x1 + 10)}M${f1(x0)} ${f1(r.y + r.h)}H${f1(x1 + 10)}` }], { cap: 'butt' });
    } else out += frame(L.front);
    out += L.fl.draw(L.front.x, L.front.y, textCol, acc, textCol);
    out += frame(L.back) + L.bl.draw(L.back.x, L.back.y, textCol);
    // barcode placeholder: always a white field, as printers require
    const bc = L.barcode;
    out += `<rect x="${f1(bc.x)}" y="${f1(bc.y)}" width="${bc.w}" height="${bc.h}" fill="#FFFFFF" stroke="${pal.ink}" stroke-width="2"/>`;
    out += `<text x="${f1(bc.x + bc.w / 2)}" y="${f1(bc.y + bc.h / 2 + 4)}" text-anchor="middle" font-family="'${MONO}'" font-weight="500" font-size="10" fill="#8A8A8A" letter-spacing="1">ISBN BARCODE</text>`;
    if (L.spine) {
      const s = L.spine;
      out += frame(s);
      const size = Math.min(s.w * 0.44, 24), cx = s.x + s.w / 2, top = s.y + 26, len = s.h - 52;
      const F = FONTS[cfg.font] || FONTS.archivo;
      const w1 = measure(TEXT.t1 + ' ' + TEXT.t2, F.w1, F.display, size);
      out += `<g transform="translate(${f1(cx)} ${f1(top)}) rotate(90)" fill="${textCol}">` +
        `<text x="0" y="${f1(size * 0.36)}" font-family="'${F.display}'" font-weight="${F.w1}" font-size="${f1(size)}">${esc(TEXT.t1 + ' ' + TEXT.t2)}</text>` +
        `<text x="${f1(w1 + size * 0.4)}" y="${f1(size * 0.36)}" font-family="'${F.display}'" font-weight="${F.w2}" font-size="${f1(size * 0.8)}">${esc(TEXT.t3)}</text>` +
        `<text x="${f1(len)}" y="${f1(size * 0.3)}" text-anchor="end" font-family="'${MONO}'" font-weight="500" font-size="${f1(Math.min(size * 0.62, 13))}" letter-spacing="2">${esc(TEXT.authorShort)}</text></g>`;
    }
    return out;
  }

  // ---------- build queue & cache
  const cache = new Map(), pending = new Map(), tasks = [];
  let running = false, uidN = 0;
  async function pump() {
    if (running) return;
    running = true;
    while (tasks.length) {
      const t = tasks.shift(); pending.delete(t.key);
      try { t.res(await t.fn()); } catch (e) { t.rej(e); }
    }
    running = false;
  }
  function schedule(key, fn, urgent) {
    return new Promise((res, rej) => { const t = { key, fn, res, rej }; pending.set(key, t); urgent ? tasks.unshift(t) : tasks.push(t); pump(); });
  }
  function build(design, cfg, urgent = false) {
    const key = JSON.stringify([design.id, cfg]);
    if (cache.has(key)) {
      const t = pending.get(key);
      if (urgent && t) { tasks.splice(tasks.indexOf(t), 1); tasks.unshift(t); }
      return cache.get(key);
    }
    const job = schedule(key, async () => {
      await fontsReady;
      const t0 = performance.now();
      const geo = geometry(cfg.spine);
      const L = plateLayout(cfg, geo, design);
      const ctx = makeCtx(design, cfg, geo, L.reserved);
      let art;
      try { art = await design.render(ctx); }
      catch (e) {
        console.error(design.id, e);
        art = `<text x="${geo.front.x + 40}" y="${geo.front.y + 500}" font-family="'${MONO}'" font-size="16" fill="#c00">Render failed: ${esc(String(e.message || e))}</text>`;
      }
      const markup = `<rect width="${geo.W}" height="${geo.H}" fill="${ctx.pal.ground}"/>${art}${drawType(ctx, L)}`;
      await yieldFrame();
      return { id: 'wrap' + (uidN++), key, design, cfg, geo, markup, ms: Math.round(performance.now() - t0) };
    }, urgent);
    cache.set(key, job);
    return job;
  }

  return { register, designs, build, geometry, PALETTES, ACCENTS, WEIGHTS, FONTS, TEXT, B, TW, TH };
})();
