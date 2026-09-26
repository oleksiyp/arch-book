// Octilinear transit map: bundled lines, interchanges, terminals.
Lab.register({
  id: 'transit',
  name: 'Integration Map',
  tagline: 'A transit map of the system',
  concept: 'A metro map of a company-sized system. Lines run in parallel bundles, split, turn at 45 degrees and meet at interchanges. It is readable up close and overwhelming from a distance. Coloured lines are the few paths that matter this quarter.',
  plate: 'top',
  render(ctx) {
    const { W, H, rng } = ctx;
    const g = rng.pick([12, 14, 16]);
    const DIRS = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
    const cols = Math.floor(W / g), rows = Math.floor(H / g);
    const P = (i, j) => [i * g + (W - cols * g) / 2, j * g + (H - rows * g) / 2];
    const okAt = (i, j) => i > 0 && j > 0 && i < cols && j < rows && ctx.free(...P(i, j), 8);
    const K = rng.int(22, 36), lines = [];
    const visits = new Map();
    for (let l = 0; l < K; l++) {
      let i, j, guard = 0;
      do { i = rng.int(1, cols - 1); j = rng.int(1, rows - 1); } while (!okAt(i, j) && guard++ < 100);
      let d = rng.int(0, 7);
      const pts = [[i, j]]; const maxLen = rng.int(40, 160);
      for (let n = 0; n < maxLen;) {
        const seg = rng.int(3, 14);
        let moved = 0;
        for (let s = 0; s < seg; s++) {
          const ni = i + DIRS[d][0], nj = j + DIRS[d][1];
          if (!okAt(ni, nj)) break;
          i = ni; j = nj; pts.push([i, j]); moved++; n++;
        }
        const turns = rng.shuffle([1, -1]);
        const opts = [...turns, ...turns.map(t => t * 2)];
        let turned = false;
        for (const t of opts) { const nd = (d + t + 8) % 8; if (okAt(i + DIRS[nd][0], j + DIRS[nd][1])) { d = nd; turned = true; break; } }
        if (!turned || (!moved && n > 0)) break;
      }
      if (pts.length < 6) continue;
      // keep corner points only
      const corners = [pts[0]];
      for (let k = 1; k < pts.length - 1; k++) {
        const a = pts[k - 1], b = pts[k], c = pts[k + 1];
        if (b[0] - a[0] !== c[0] - b[0] || b[1] - a[1] !== c[1] - b[1]) corners.push(b);
      }
      corners.push(pts[pts.length - 1]);
      for (const p of pts) { const k = p[0] + ',' + p[1]; visits.set(k, (visits.get(k) || 0) + 1); }
      lines.push(corners.map(p => P(p[0], p[1])));
    }
    const strokes = [], dots = [];
    const colored = rng.int(3, 6);
    lines.forEach((pts, n) => {
      const bundle = rng.chance(0.35) ? rng.int(2, 4) : 1;
      const lead = n < colored ? ctx.accent(n) : null;
      for (let b = 0; b < bundle; b++) {
        const off = (b - (bundle - 1) / 2) * (ctx.lw + 2 * ctx.bw + 3);
        const q = off ? ctx.offsetPolyline(pts, off) : pts;
        const col = b === 0 ? lead : (rng.chance(0.25) ? ctx.accent(rng.int(0, 1)) : null);
        strokes.push({ d: ctx.rounded(q, g * 1.6), color: col });
      }
      const [a, z] = [pts[0], pts[pts.length - 1]];
      dots.push([a, lead], [z, lead]);
    });
    strokes.sort((s, t) => (s.color ? 1 : 0) - (t.color ? 1 : 0));
    let out = ctx.cased(strokes);
    // interchanges where three or more lines pass the same point
    const hubs = [...visits].filter(([, v]) => v >= 3).map(([k]) => k.split(',').map(Number));
    rng.shuffle(hubs);
    for (const [i, j] of hubs.slice(0, 30)) { const [x, y] = P(i, j); if (ctx.free(x, y, 10)) out += ctx.dot(x, y, ctx.lw + 3, ctx.pal.line); }
    for (const [p, col] of dots) out += ctx.dot(p[0], p[1], ctx.lw * 0.9 + 1, col || ctx.pal.line);
    return out;
  },
});
