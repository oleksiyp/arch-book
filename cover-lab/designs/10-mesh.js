// Service dependency graph: clusters, hubs, a gravity well on the front cover.
Lab.register({
  id: 'mesh',
  name: 'Service Mesh',
  tagline: 'The dependency hairball',
  concept: 'The famous microservice death-star diagram, drawn by hand. Tight clusters of services, a few hubs everything depends on, and one gravity well on the front cover that pulls every edge toward it. The coloured clusters are the teams that have their boundaries right.',
  plate: 'top',
  render(ctx) {
    const { W, H, rng, front, pal, f1 } = ctx;
    const k = rng.int(7, 12), centers = [];
    for (let t = 0; centers.length < k && t < 2000; t++) {
      const x = rng.range(40, W - 40), y = rng.range(40, H - 40);
      if (ctx.free(x, y, 50) && centers.every(c => Math.hypot(c[0] - x, c[1] - y) > 170)) centers.push([x, y]);
    }
    const nodes = [], clusters = [];
    const colored = ctx.accents.length ? rng.int(2, 3) : 0;
    centers.forEach((c, ci) => {
      const n = rng.int(6, 22), sig = 22 + n * 2.6, list = [];
      const color = ci < colored ? ctx.accent(ci) : null;
      for (let t = 0; list.length < n && t < n * 40; t++) {
        const x = c[0] + rng.gauss() * sig, y = c[1] + rng.gauss() * sig;
        if (!ctx.inBounds(x, y, -10) || !ctx.free(x, y, 12)) continue;
        if (nodes.some(q => Math.hypot(q.x - x, q.y - y) < 17)) continue;
        const node = { x, y, r: list.length ? rng.range(4.5, 7) : 10, c: ci, color };
        nodes.push(node); list.push(node);
      }
      if (list.length) clusters.push(list);
    });
    // gravity well: a mega hub on the free part of the front cover
    let mx = front.x + front.w / 2, my = front.y + front.h * 0.68;
    for (let t = 0; t < 200 && !ctx.free(mx, my, 40); t++) { mx = front.x + rng.range(0.2, 0.8) * front.w; my = front.y + rng.range(0.1, 0.9) * front.h; }
    const mega = { x: mx, y: my, r: 17, c: -1, color: null };
    const edges = [];
    const link = (a, b) => { if (a !== b) edges.push([a, b]); };
    for (const list of clusters) {
      const hub = list[0];
      for (const nd of list.slice(1)) { link(hub, nd); if (rng.chance(0.45)) link(nd, rng.pick(list)); }
    }
    for (let i = 0; i < clusters.length; i++) for (let t = rng.int(1, 3); t > 0; t--) link(clusters[i][0], rng.pick(clusters)[0]);
    for (let t = rng.int(20, 60); t > 0; t--) link(rng.pick(nodes), rng.pick(nodes));
    for (let t = rng.int(30, 70); t > 0; t--) link(mega, rng.pick(nodes));
    const strokes = edges.map(([a, b]) => {
      const dx = b.x - a.x, dy = b.y - a.y, bend = rng.range(-0.22, 0.22);
      const cx = (a.x + b.x) / 2 - dy * bend, cy = (a.y + b.y) / 2 + dx * bend;
      const col = a.color && a.color === b.color ? a.color : null;
      return { d: `M${f1(a.x)} ${f1(a.y)}Q${f1(cx)} ${f1(cy)} ${f1(b.x)} ${f1(b.y)}`, color: col, w: a === mega || b === mega ? ctx.lw * 0.75 : ctx.lw };
    });
    strokes.sort((s, t) => (s.color ? 1 : 0) - (t.color ? 1 : 0));
    let out = ctx.cased(strokes);
    for (const nd of nodes) out += ctx.dot(nd.x, nd.y, nd.r, nd.color || pal.line);
    out += ctx.dot(mega.x, mega.y, mega.r + 8, pal.line) + ctx.dot(mega.x, mega.y, mega.r, ctx.accent(0) || pal.line) + ctx.dot(mega.x, mega.y, 5, pal.line);
    return out;
  },
});
