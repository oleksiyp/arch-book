// Gray–Scott reaction–diffusion with spatially varying feed/kill, traced as contours.
Lab.register({
  id: 'turing',
  name: 'Emergence',
  tagline: 'Simple rules, living pattern',
  concept: 'A Turing pattern: two chemicals and two rules, and out comes coral, fingerprints and mazes. The parameters drift across the book, so spots turn into worms and worms turn into labyrinths. No one designed the whole, yet it is coherent. That is emergent architecture.',
  plate: 'top',
  async render(ctx) {
    const { W, H, rng, noise, pal } = ctx;
    const cs = rng.pick([6, 7, 8]);
    const gw = Math.ceil(W / cs) + 2, gh = Math.ceil(H / cs) + 2, N = gw * gh;
    let U = new Float32Array(N).fill(1), V = new Float32Array(N);
    let U2 = new Float32Array(N), V2 = new Float32Array(N);
    const PRESETS = [[0.0545, 0.062], [0.029, 0.057], [0.037, 0.06], [0.058, 0.065], [0.039, 0.058], [0.03, 0.055]];
    const pA = rng.pick(PRESETS), pB = rng.pick(PRESETS);
    const Fm = new Float32Array(N), Km = new Float32Array(N);
    for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) {
      let t = (noise.fbm(i * cs / 500, j * cs / 500, 2) + 0.7) / 1.4; t = Math.max(0, Math.min(1, t)); t = t * t * (3 - 2 * t);
      Fm[j * gw + i] = pA[0] + (pB[0] - pA[0]) * t; Km[j * gw + i] = pA[1] + (pB[1] - pA[1]) * t;
    }
    for (let s = 0; s < N / 40; s++) {
      const ci = rng.int(3, gw - 4), cj = rng.int(3, gh - 4);
      for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) { const k = (cj + b) * gw + ci + a; U[k] = 0.5; V[k] = 0.25 + rng.range(0, 0.1); }
    }
    const iters = rng.int(6000, 8000);
    for (let it = 0; it < iters; it++) {
      for (let j = 1; j < gh - 1; j++) {
        const r = j * gw;
        for (let i = 1; i < gw - 1; i++) {
          const k = r + i;
          const lu = 0.2 * (U[k - 1] + U[k + 1] + U[k - gw] + U[k + gw]) + 0.05 * (U[k - gw - 1] + U[k - gw + 1] + U[k + gw - 1] + U[k + gw + 1]) - U[k];
          const lv = 0.2 * (V[k - 1] + V[k + 1] + V[k - gw] + V[k + gw]) + 0.05 * (V[k - gw - 1] + V[k - gw + 1] + V[k + gw - 1] + V[k + gw + 1]) - V[k];
          const u = U[k], v = V[k], uvv = u * v * v;
          U2[k] = u + lu - uvv + Fm[k] * (1 - u);
          V2[k] = v + 0.5 * lv + uvv - (Km[k] + Fm[k]) * v;
        }
      }
      [U, U2] = [U2, U]; [V, V2] = [V2, V];
      for (let i = 0; i < gw; i++) { U[i] = U[N - gw + i] = 1; V[i] = V[N - gw + i] = 0; }
      for (let j = 0; j < gh; j++) { U[j * gw] = U[j * gw + gw - 1] = 1; V[j * gw] = V[j * gw + gw - 1] = 0; }
      if (it % 200 === 0) await ctx.yieldFrame();
    }
    const cont = ctx.contours(V, gw, gh, cs, 0.2, -cs, -cs);
    const picked = rng.pick(['outline', 'outline', 'solid']);
    const mode = ctx.cfg.mode || picked; // cfg.mode overrides without changing the pattern
    let out = '';
    if (mode === 'solid') {
      const d = cont.filter(c => c.closed && c.pts.length > 4).map(c => ctx.smooth(c.pts.filter((_, i) => i % 2 === 0), true)).join('');
      out += `<path d="${d}" fill="${pal.ink}" fill-rule="evenodd"/>`;
      ctx.zones.forEach((z, i) => {
        const id = `${ctx.uid}z${i}`;
        out += `<clipPath id="${id}"><path d="${ctx.smooth(z.poly, true)}"/></clipPath><path d="${d}" fill="${z.color}" fill-rule="evenodd" clip-path="url(#${id})"/>`;
      });
      out += ctx.cased(cont.map(c => ({ d: ctx.smooth(c.pts.filter((_, i) => i % 2 === 0), c.closed) })));
    } else {
      const strokes = [];
      for (const c of cont) { const p = c.pts.filter((_, i) => i % 2 === 0); if (p.length > 2) strokes.push(...ctx.line(p, { closed: c.closed })); }
      out += ctx.cased(strokes);
    }
    return out;
  },
});
