// A perfect maze grown as a tree of corridors; the route through it is coloured.
Lab.register({
  id: 'road',
  name: 'The Road',
  tagline: 'One route through a labyrinth',
  concept: 'A maze grown as one tree of corridors that wraps the whole book. Every corridor is reachable and nothing is simple. One coloured route runs from the back cover, over the spine, to the title: the road to platform architecture. A second colour marks a different route through the same system.',
  plate: 'top',
  render(ctx) {
    const { W, H, rng, front, back } = ctx;
    const g = rng.pick([18, 20, 22, 26]);
    const cols = Math.floor(W / g), rows = Math.floor(H / g);
    const ox = (W - cols * g) / 2 + g / 2, oy = (H - rows * g) / 2 + g / 2;
    const P = k => [ox + (k % cols) * g, oy + Math.floor(k / cols) * g];
    const N = cols * rows, ok = new Uint8Array(N), seen = new Uint8Array(N);
    for (let k = 0; k < N; k++) { const [x, y] = P(k); ok[k] = ctx.free(x, y, g * 0.45) ? 1 : 0; }
    const adj = Array.from({ length: N }, () => []);
    const nb = k => {
      const i = k % cols, j = Math.floor(k / cols), r = [];
      if (i > 0) r.push(k - 1); if (i < cols - 1) r.push(k + 1); if (j > 0) r.push(k - cols); if (j < rows - 1) r.push(k + cols);
      return r.filter(q => ok[q]);
    };
    const edges = [];
    const grow = start => {
      const stack = [start]; seen[start] = 1;
      while (stack.length) {
        const k = stack[stack.length - 1];
        // bias toward continuing straight to get long corridors
        const opts = rng.shuffle(nb(k).filter(q => !seen[q]));
        if (!opts.length) { stack.pop(); continue; }
        const q = opts[0];
        seen[q] = 1; adj[k].push(q); adj[q].push(k); edges.push([k, q]); stack.push(q);
      }
    };
    const order = rng.shuffle([...Array(N).keys()]);
    for (const k of order) if (ok[k] && !seen[k]) grow(k);
    // a few loops so it reads as a system rather than a pure tree
    const braid = rng.range(0.0, 0.04);
    for (let k = 0; k < N; k++) if (ok[k] && rng.chance(braid)) {
      const q = rng.pick(nb(k)); if (q !== undefined && !adj[k].includes(q)) { adj[k].push(q); adj[q].push(k); edges.push([k, q]); }
    }
    const nearest = (x, y) => {
      let best = -1, bd = Infinity;
      for (let k = 0; k < N; k++) if (ok[k]) { const [a, b] = P(k); const d = (a - x) ** 2 + (b - y) ** 2; if (d < bd) { bd = d; best = k; } }
      return best;
    };
    const route = (a, b) => {
      const prev = new Int32Array(N).fill(-2); prev[a] = -1; const q = [a];
      for (let h = 0; h < q.length; h++) { const k = q[h]; if (k === b) break; for (const n of adj[k]) if (prev[n] === -2) { prev[n] = k; q.push(n); } }
      if (prev[b] === -2) return [];
      const path = []; for (let k = b; k !== -1; k = prev[k]) path.push(k);
      return path.reverse();
    };
    const plateTop = ctx.reserved[0].y < front.y + 300;
    const routes = [
      [nearest(back.x + 60, back.y + back.h - 40), nearest(front.x + front.w * rng.range(0.3, 0.7), plateTop ? front.y + front.h * 0.7 : front.y + front.h * 0.3)],
      [nearest(back.x + back.w * 0.8, back.y + back.h * 0.75), nearest(front.x + front.w - 50, plateTop ? front.y + front.h - 50 : front.y + 60)],
    ];
    const edgeColor = new Map(), ends = [];
    routes.forEach(([a, b], i) => {
      const col = ctx.accent(i); if (!col || a < 0 || b < 0) return;
      const path = route(a, b);
      for (let t = 1; t < path.length; t++) edgeColor.set(Math.min(path[t - 1], path[t]) + ':' + Math.max(path[t - 1], path[t]), col);
      if (path.length) ends.push([P(a), col], [P(b), col]);
    });
    const strokes = edges.map(([a, b]) => ({ d: ctx.pathL([P(a), P(b)]), color: edgeColor.get(Math.min(a, b) + ':' + Math.max(a, b)) }));
    // draw coloured corridors last so they sit on top at junctions
    strokes.sort((s, t) => (s.color ? 1 : 0) - (t.color ? 1 : 0));
    return ctx.cased(strokes) + ends.map(([p, col]) => ctx.dot(p[0], p[1], g * 0.36, col)).join('');
  },
});
