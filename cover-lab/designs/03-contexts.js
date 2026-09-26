// Voronoi tissue: cells of varying density; coloured contexts split into sub-domains.
Lab.register({
  id: 'contexts',
  name: 'Bounded Contexts',
  tagline: 'Tissue, cells, sub-domains',
  concept: 'Voronoi tissue with dense and sparse regions, like a system that grew under uneven pressure. Every wall is shared by two neighbours. A few clusters of cells are coloured as bounded contexts, and inside each one the tissue divides again into sub-domains.',
  plate: 'top',
  render(ctx) {
    const { W, H, rng, noise } = ctx;
    const D = window.d3 && window.d3.Delaunay;
    if (!D) throw new Error('d3-delaunay did not load');
    const rMin = rng.pick([12, 14, 16]), rMax = rng.pick([48, 60, 72]), sc = rng.range(1 / 420, 1 / 220);
    const rad = (x, y) => { const t = (noise.fbm(x * sc, y * sc, 3) + 1) / 2; return rMin + (rMax - rMin) * Math.pow(Math.min(1, Math.max(0, t)), 1.6); };
    const cell = rMax, gw = Math.ceil(W / cell) + 1, grid = new Map(), pts = [];
    const tries = 26000;
    for (let t = 0; t < tries; t++) {
      const x = rng.range(-10, W + 10), y = rng.range(-10, H + 10), r = rad(x, y);
      const gi = Math.floor(x / cell), gj = Math.floor(y / cell);
      let okp = true;
      for (let a = -1; a <= 1 && okp; a++) for (let b = -1; b <= 1 && okp; b++) {
        for (const q of grid.get((gi + a) + gj * gw + b * gw) || []) if (Math.hypot(q[0] - x, q[1] - y) < Math.min(r, q[2])) { okp = false; break; }
      }
      if (!okp) continue;
      const k = gi + gj * gw; const p = [x, y, r];
      (grid.get(k) || grid.set(k, []).get(k)).push(p); pts.push(p);
    }
    const del = D.from(pts, p => p[0], p => p[1]);
    const vor = del.voronoi([-20, -20, W + 20, H + 20]);
    // grow a few coloured contexts by flood fill
    const tag = new Int8Array(pts.length).fill(-1);
    const nCtx = ctx.accents.length ? rng.int(3, 6) : 0;
    for (let c = 0; c < nCtx; c++) {
      let s = rng.int(0, pts.length - 1), guard = 0;
      while ((tag[s] >= 0 || !ctx.free(pts[s][0], pts[s][1], 40)) && guard++ < 200) s = rng.int(0, pts.length - 1);
      const want = rng.int(3, 14), q = [s]; tag[s] = c;
      for (let h = 0, n = 1; h < q.length && n < want; h++) for (const nb of del.neighbors(q[h])) if (tag[nb] < 0 && n < want && rng.chance(0.7)) { tag[nb] = c; q.push(nb); n++; }
    }
    let out = '';
    const clips = [], subs = [];
    for (let i = 0; i < pts.length; i++) {
      if (tag[i] < 0) continue;
      const col = ctx.accent(tag[i]);
      const d = vor.renderCell(i);
      out += `<path d="${d}" fill="${col}"/>`;
      const poly = vor.cellPolygon(i); if (!poly) continue;
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      for (const [x, y] of poly) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
      const area = (x1 - x0) * (y1 - y0);
      const m = Math.round(Math.min(14, area / 500));
      if (m < 3) continue;
      const sp = [];
      for (let t = 0; t < m * 20 && sp.length < m; t++) { const x = rng.range(x0, x1), y = rng.range(y0, y1); if (vor.contains(i, x, y)) sp.push([x, y]); }
      if (sp.length < 3) continue;
      const sv = D.from(sp).voronoi([x0 - 2, y0 - 2, x1 + 2, y1 + 2]);
      const id = `${ctx.uid}c${i}`;
      clips.push(`<clipPath id="${id}"><path d="${d}"/></clipPath>`);
      subs.push(`<g clip-path="url(#${id})">${ctx.cased([{ d: sv.render(), w: ctx.lw * 0.75 }], {})}</g>`);
    }
    out = `<defs>${clips.join('')}</defs>` + out + subs.join('');
    out += ctx.cased([{ d: vor.render() }]);
    // nuclei in some plain cells
    for (let i = 0; i < pts.length; i++) {
      if (tag[i] >= 0 || !rng.chance(0.14) || pts[i][2] < 24) continue;
      const [x, y] = pts[i];
      if (ctx.free(x, y, 10)) out += `<circle cx="${ctx.f1(x)}" cy="${ctx.f1(y)}" r="${ctx.f1(rng.range(3, 6))}" fill="${ctx.pal.ink}"/>`;
    }
    return out;
  },
});
