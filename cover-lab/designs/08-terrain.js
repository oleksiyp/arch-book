// Contour lines of a domain-warped height field.
Lab.register({
  id: 'terrain',
  name: 'Terrain',
  tagline: 'The landscape under the system',
  concept: 'A contour map of a domain-warped landscape. Lines bunch into black cliffs where the ground is steep and open out on plateaus. Architecture is reading terrain: where change is cheap, where it is steep, where you should not build. Coloured isolines mark the ridges and valleys that matter.',
  plate: 'top',
  render(ctx) {
    const { W, H, rng, noise } = ctx;
    const sc = rng.range(1 / 700, 1 / 380), warp = rng.range(0.8, 2.2), cs = 6;
    const gw = Math.ceil(W / cs) + 3, gh = Math.ceil(H / cs) + 3;
    const f = new Float32Array(gw * gh);
    let lo = Infinity, hi = -Infinity;
    for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) {
      const x = (i - 1) * cs * sc, y = (j - 1) * cs * sc;
      const qx = noise.fbm(x + 3.1, y + 7.7, 3), qy = noise.fbm(x - 5.2, y + 1.3, 3);
      const v = noise.fbm(x + warp * qx, y + warp * qy, 5);
      f[j * gw + i] = v; lo = Math.min(lo, v); hi = Math.max(hi, v);
    }
    const n = rng.int(12, 22), mode = rng.pick(['levels', 'zones']);
    const special = new Map();
    if (ctx.accents.length) { special.set(n - 1, ctx.accent(0)); special.set(n - 2, ctx.accent(0)); special.set(rng.int(1, 3), ctx.accent(1)); }
    const strokes = [];
    for (let k = 1; k < n; k++) {
      const level = lo + (hi - lo) * k / n;
      for (const c of ctx.contours(f, gw, gh, cs, level, -cs, -cs)) {
        // split lines where they enter the title plates
        for (const r of ctx.runs(c.pts.filter((_, i) => i % 2 === 0), (x, y) => ctx.free(x, y, 2))) {
          if (!r.v || r.pts.length < 3) continue;
          const closed = c.closed && r.pts.length === Math.ceil(c.pts.length / 2);
          if (mode === 'levels') strokes.push({ d: ctx.smooth(r.pts, closed), color: special.get(k) || null });
          else strokes.push(...ctx.line(r.pts, { closed }));
        }
      }
    }
    return ctx.cased(strokes);
  },
});
