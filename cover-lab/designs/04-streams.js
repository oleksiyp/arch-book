// Evenly spaced streamlines through a noise flow field (Jobard–Lefer seeding).
Lab.register({
  id: 'streams',
  name: 'Streams',
  tagline: 'Events flowing around obstacles',
  concept: 'Evenly spaced streamlines through a turbulent field. They never cross, they bend around every obstacle, and they crowd where the flow tightens. Think of event streams and back-pressure, or wood grain. Where a line passes through a hot zone it lights up in colour.',
  plate: 'top',
  async render(ctx) {
    const { W, H, rng, noise } = ctx;
    const sc = rng.range(1 / 520, 1 / 260), twist = rng.range(1.4, 3.2), base = rng.range(0, Math.PI * 2);
    const ang = (x, y) => base + noise.fbm(x * sc, y * sc, 3) * Math.PI * twist;
    const dsep = ctx.lw + 2 * ctx.bw + rng.pick([4, 6, 9, 13]), dtest = dsep * 0.62, step = 2.5;
    const cs = dsep, gw = Math.ceil(W / cs) + 2, gh = Math.ceil(H / cs) + 2;
    const grid = Array.from({ length: gw * gh }, () => []);
    const gk = (x, y) => (Math.floor(y / cs) + 1) * gw + Math.floor(x / cs) + 1;
    const near = (x, y, d) => {
      const gi = Math.floor(x / cs) + 1, gj = Math.floor(y / cs) + 1, d2 = d * d;
      for (let j = gj - 1; j <= gj + 1; j++) for (let i = gi - 1; i <= gi + 1; i++) {
        if (i < 0 || j < 0 || i >= gw || j >= gh) continue;
        for (const p of grid[j * gw + i]) if ((p[0] - x) ** 2 + (p[1] - y) ** 2 < d2) return true;
      }
      return false;
    };
    const valid = (x, y, d) => x > 0 && y > 0 && x < W && y < H && ctx.free(x, y, 4) && !near(x, y, d);
    const trace = (sx, sy) => {
      const halves = [];
      for (const dir of [1, -1]) {
        const pts = []; let x = sx, y = sy;
        for (let n = 0; n < 1400; n++) {
          const a1 = ang(x, y) + (dir < 0 ? Math.PI : 0);
          const mx = x + Math.cos(a1) * step / 2, my = y + Math.sin(a1) * step / 2;
          const a2 = ang(mx, my) + (dir < 0 ? Math.PI : 0);
          const nx = x + Math.cos(a2) * step, ny = y + Math.sin(a2) * step;
          if (!valid(nx, ny, dtest)) break;
          // self-avoid: stay away from our own earlier points
          let self = false;
          for (let k = pts.length - Math.ceil(dsep * 3 / step); k >= 0; k -= 2) if ((pts[k][0] - nx) ** 2 + (pts[k][1] - ny) ** 2 < dtest * dtest) { self = true; break; }
          if (self) break;
          pts.push([nx, ny]); x = nx; y = ny;
        }
        halves.push(pts);
      }
      return [...halves[1].reverse(), [sx, sy], ...halves[0]];
    };
    const lines = [], queue = [];
    const addLine = pts => { for (const p of pts) grid[gk(p[0], p[1])].push(p); lines.push(pts); queue.push(pts); };
    const minLen = Math.ceil(30 / step);
    let tries = 0;
    const seedRandom = () => {
      for (let t = 0; t < 60; t++) {
        const x = rng.range(0, W), y = rng.range(0, H);
        if (valid(x, y, dsep)) { const l = trace(x, y); if (l.length > minLen) { addLine(l); return true; } }
      }
      return false;
    };
    seedRandom();
    while (tries++ < 400) {
      while (queue.length) {
        const l = queue.shift();
        for (let k = 0; k < l.length; k += 3) {
          const a = k > 0 ? l[k - 1] : l[k], b = l[Math.min(l.length - 1, k + 1)];
          let nx = -(b[1] - a[1]), ny = b[0] - a[0]; const nl = Math.hypot(nx, ny) || 1; nx /= nl; ny /= nl;
          for (const s of [1, -1]) {
            const x = l[k][0] + nx * dsep * s, y = l[k][1] + ny * dsep * s;
            if (valid(x, y, dsep)) { const nl2 = trace(x, y); if (nl2.length > minLen) addLine(nl2); }
          }
        }
        if (lines.length % 60 === 0) await ctx.yieldFrame();
      }
      if (!seedRandom()) break;
    }
    const strokes = [];
    for (const l of lines) {
      const dec = l.filter((_, i) => i % 3 === 0 || i === l.length - 1);
      strokes.push(...ctx.line(dec));
    }
    return ctx.cased(strokes);
  },
});
