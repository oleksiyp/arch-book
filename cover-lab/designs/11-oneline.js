// Differential growth: closed loops that buckle as they grow, like brain coral.
Lab.register({
  id: 'oneline',
  name: 'One Line',
  tagline: 'A single boundary, endlessly folded',
  concept: 'Differential growth: a closed loop that keeps getting longer inside a space that does not. It buckles into coral and brain folds and never crosses itself. It is one boundary, and all of its complexity comes from growing under constraints.',
  plate: 'top',
  async render(ctx) {
    const { W, H, rng, front, back } = ctx;
    const R = ctx.lw + 2 * ctx.bw + rng.pick([6, 8, 11]);
    const maxE = R * 0.42, Nmax = rng.int(6000, 9000);
    const loops = [];
    const seeds = rng.int(2, 3);
    const spots = [[front.x + front.w * rng.range(0.3, 0.7), front.y + front.h * rng.range(0.55, 0.75)],
      [back.x + back.w * rng.range(0.3, 0.7), back.y + back.h * 0.78], [W / 2, H * 0.15]];
    for (let s = 0; s < seeds; s++) {
      let [cx, cy] = spots[s];
      for (let t = 0; t < 100 && !ctx.free(cx, cy, 40); t++) { cx = rng.range(40, W - 40); cy = rng.range(40, H - 40); }
      const n = 24, r = 30, xs = [], ys = [];
      for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; xs.push(cx + Math.cos(a) * r); ys.push(cy + Math.sin(a) * r); }
      loops.push({ x: xs, y: ys });
    }
    const cs = R, gw = Math.ceil(W / cs) + 2, gh = Math.ceil(H / cs) + 2;
    for (let it = 0; it < 4000; it++) {
      let total = 0; for (const l of loops) total += l.x.length;
      if (total > Nmax) break;
      // spatial hash of all nodes
      const X = new Float64Array(total), Y = new Float64Array(total), L = new Int32Array(total), I = new Int32Array(total);
      let t = 0;
      loops.forEach((l, li) => { for (let i = 0; i < l.x.length; i++, t++) { X[t] = l.x[i]; Y[t] = l.y[i]; L[t] = li; I[t] = i; } });
      const cnt = new Int32Array(gw * gh + 1), cell = new Int32Array(total);
      for (let q = 0; q < total; q++) { const c = (Math.floor(Y[q] / cs) + 1) * gw + Math.floor(X[q] / cs) + 1; cell[q] = c; cnt[c + 1]++; }
      for (let c = 0; c < gw * gh; c++) cnt[c + 1] += cnt[c];
      const fill = cnt.slice(), order = new Int32Array(total);
      for (let q = 0; q < total; q++) order[fill[cell[q]]++] = q;
      t = 0;
      for (let li = 0; li < loops.length; li++) {
        const l = loops[li], n = l.x.length, nx = new Array(n), ny = new Array(n);
        for (let i = 0; i < n; i++, t++) {
          const x = l.x[i], y = l.y[i];
          const pi = (i - 1 + n) % n, ni = (i + 1) % n;
          let fx = ((l.x[pi] + l.x[ni]) / 2 - x) * 0.45, fy = ((l.y[pi] + l.y[ni]) / 2 - y) * 0.45;
          const c0 = cell[t], gx = c0 % gw, gy = Math.floor(c0 / gw);
          for (let b = -1; b <= 1; b++) for (let a = -1; a <= 1; a++) {
            const c = (gy + b) * gw + gx + a; if (c < 0 || c >= gw * gh) continue;
            for (let o = cnt[c]; o < cnt[c + 1]; o++) {
              const q = order[o]; if (q === t) continue;
              if (L[q] === li && (I[q] === pi || I[q] === ni)) continue;
              const dx = x - X[q], dy = y - Y[q], d2 = dx * dx + dy * dy;
              if (d2 < R * R && d2 > 1e-6) { const d = Math.sqrt(d2), k = (R - d) / R * 0.55 / d; fx += dx * k; fy += dy * k; }
            }
          }
          const m = Math.hypot(fx, fy); if (m > 1.2) { fx *= 1.2 / m; fy *= 1.2 / m; }
          const tx = x + fx, ty = y + fy;
          if (tx > 4 && ty > 4 && tx < W - 4 && ty < H - 4 && ctx.free(tx, ty, R * 0.6)) { nx[i] = tx; ny[i] = ty; } else { nx[i] = x; ny[i] = y; }
        }
        // split long edges; occasionally split short ones to seed new folds
        const ox = [], oy = [];
        for (let i = 0; i < n; i++) {
          ox.push(nx[i]); oy.push(ny[i]);
          const j = (i + 1) % n, e = Math.hypot(nx[j] - nx[i], ny[j] - ny[i]);
          if (e > maxE || (e > maxE * 0.3 && rng.chance(0.03))) { ox.push((nx[i] + nx[j]) / 2); oy.push((ny[i] + ny[j]) / 2); }
        }
        l.x = ox; l.y = oy;
      }
      if (it % 15 === 0) await ctx.yieldFrame();
    }
    const strokes = [];
    for (const l of loops) {
      const pts = l.x.map((x, i) => [x, l.y[i]]).filter((_, i) => i % 2 === 0);
      strokes.push(...ctx.line(pts, { closed: true }));
    }
    return ctx.cased(strokes);
  },
});
