// Space colonisation: a root / mycelium network that branches toward open space.
Lab.register({
  id: 'roots',
  name: 'Root System',
  tagline: 'Growth that finds every gap',
  concept: 'A root system grown by space colonisation. Branches reach toward open ground, thicken where they carry more, and split until nothing is left unclaimed. Dependencies grow the same way. Coloured subtrees are the parts of the system that are alive right now.',
  plate: 'top',
  async render(ctx) {
    const { W, H, rng, noise, front } = ctx;
    const mode = rng.pick(['tree', 'tree', 'mycelium']);
    const Di = rng.pick([48, 60, 72]), Dk = 9, step = 5.5;
    const nA = rng.int(1800, 2800);
    const ax = [], ay = [];
    for (let t = 0; ax.length < nA && t < nA * 6; t++) {
      const x = rng.range(0, W), y = rng.range(0, H);
      if (!ctx.free(x, y, 10)) continue;
      const dens = 0.25 + 0.75 * Math.max(0, Math.min(1, (noise.fbm(x / 260, y / 260, 3) + 0.6)));
      if (rng.chance(dens)) { ax.push(x); ay.push(y); }
    }
    const nx = [], ny = [], par = [];
    const addNode = (x, y, p) => { nx.push(x); ny.push(y); par.push(p); return nx.length - 1; };
    if (mode === 'tree') {
      const k = rng.int(4, 7);
      for (let i = 0; i < k; i++) {
        const x = W * (i + 0.5) / k + rng.range(-40, 40);
        let prev = addNode(x, H + 4, -1);
        // trunk: straight up until it reaches attractors
        for (let s = 1; s < 8; s++) prev = addNode(x, H + 4 - s * step, prev);
      }
    } else {
      const k = rng.int(2, 4);
      for (let i = 0; i < k; i++) addNode(front.x + rng.range(0.15, 0.85) * front.w - (i % 2) * 620, rng.range(0.3, 0.9) * H, -1);
    }
    const alive = new Uint8Array(ax.length).fill(1);
    const cs = Di, gw = Math.ceil(W / cs) + 3, gh = Math.ceil(H / cs) + 3;
    const grid = Array.from({ length: gw * gh }, () => []);
    const gi = (x, y) => (Math.max(0, Math.min(gh - 1, Math.floor(y / cs) + 1))) * gw + Math.max(0, Math.min(gw - 1, Math.floor(x / cs) + 1));
    for (let i = 0; i < nx.length; i++) grid[gi(nx[i], ny[i])].push(i);
    for (let it = 0; it < 420; it++) {
      const fx = new Map();
      for (let a = 0; a < ax.length; a++) {
        if (!alive[a]) continue;
        const x = ax[a], y = ay[a];
        const ci = Math.floor(x / cs) + 1, cj = Math.floor(y / cs) + 1;
        let best = -1, bd = Di * Di;
        for (let j = cj - 1; j <= cj + 1; j++) for (let i = ci - 1; i <= ci + 1; i++) {
          if (i < 0 || j < 0 || i >= gw || j >= gh) continue;
          for (const n of grid[j * gw + i]) { const d = (nx[n] - x) ** 2 + (ny[n] - y) ** 2; if (d < bd) { bd = d; best = n; } }
        }
        if (best < 0) continue;
        if (bd < Dk * Dk) { alive[a] = 0; continue; }
        const d = Math.sqrt(bd), v = fx.get(best) || [0, 0];
        v[0] += (x - nx[best]) / d; v[1] += (y - ny[best]) / d; fx.set(best, v);
      }
      if (!fx.size) break;
      for (const [n, v] of fx) {
        const l = Math.hypot(v[0], v[1]); if (l < 1e-6) continue;
        const x = nx[n] + (v[0] / l + rng.range(-0.15, 0.15)) * step, y = ny[n] + (v[1] / l + rng.range(-0.15, 0.15)) * step;
        const id = addNode(x, y, n); grid[gi(x, y)].push(id);
      }
      if (it % 30 === 29) await ctx.yieldFrame();
    }
    // thickness from the number of descendants
    const desc = new Float64Array(nx.length).fill(1);
    for (let i = nx.length - 1; i >= 0; i--) if (par[i] >= 0) desc[par[i]] += desc[i];
    const tag = new Int8Array(nx.length).fill(-1);
    if (ctx.accents.length) {
      const cands = [];
      for (let i = 0; i < nx.length; i++) if (desc[i] > 30 && desc[i] < 400 && par[i] >= 0) cands.push(i);
      rng.shuffle(cands);
      cands.slice(0, rng.int(2, 5)).forEach((c, k) => { tag[c] = k; });
      for (let i = 0; i < nx.length; i++) if (tag[i] < 0 && par[i] >= 0 && tag[par[i]] >= 0) tag[i] = tag[par[i]];
    }
    const lw = ctx.lw, strokes = [];
    for (let i = 0; i < nx.length; i++) {
      const p = par[i]; if (p < 0) continue;
      const w = desc[i] > 600 ? lw * 2.5 : desc[i] > 150 ? lw * 2 : desc[i] > 30 ? lw * 1.5 : lw;
      strokes.push({ d: `M${ctx.f1(nx[p])} ${ctx.f1(ny[p])}L${ctx.f1(nx[i])} ${ctx.f1(ny[i])}`, w, color: tag[i] >= 0 ? ctx.accent(tag[i]) : null });
    }
    let out = ctx.cased(strokes);
    for (let i = 0; i < nx.length; i++) if (tag[i] >= 0 && desc[i] === 1 && rng.chance(0.35)) out += ctx.dot(nx[i], ny[i], lw * 0.8, ctx.accent(tag[i]));
    return out;
  },
});
