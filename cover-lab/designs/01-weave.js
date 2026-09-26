// Truchet weave: quarter-arc tiles plus occasional over/under crossings.
Lab.register({
  id: 'weave',
  name: 'Coupling',
  tagline: 'Local decisions, global knots',
  concept: 'Every tile is a trivial local choice: two quarter arcs, or a crossing. Follow any thread and it runs across the whole book, passing over some threads and under others. That is coupling: you only see it when you trace one end to the other. The longest threads are coloured.',
  plate: 'top',
  render(ctx) {
    const { W, H, rng, f1 } = ctx;
    const c = rng.pick([28, 32, 36, 40]), pc = rng.range(0.05, 0.16);
    const cols = Math.ceil(W / c), rows = Math.ceil(H / c);
    const ox = (W - cols * c) / 2, oy = (H - rows * c) / 2;
    const ids = new Map(), parent = [];
    const node = k => { if (!ids.has(k)) { ids.set(k, parent.length); parent.push(parent.length); } return ids.get(k); };
    const find = x => { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; };
    const union = (a, b) => { a = find(a); b = find(b); if (a !== b) parent[a] = b; };
    const arc = (p0, p1, cc) => {
      const r = c / 2, cr = (p0[0] - cc[0]) * (p1[1] - cc[1]) - (p0[1] - cc[1]) * (p1[0] - cc[0]);
      return `M${f1(p0[0])} ${f1(p0[1])}A${r} ${r} 0 0 ${cr > 0 ? 1 : 0} ${f1(p1[0])} ${f1(p1[1])}`;
    };
    const segs = [];
    for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
      const x0 = ox + i * c, y0 = oy + j * c, cx = x0 + c / 2, cy = y0 + c / 2;
      if (!ctx.free(cx, cy, c * 0.5)) continue;
      const N = node(`h${i},${j}`), S = node(`h${i},${j + 1}`), Wn = node(`v${i},${j}`), E = node(`v${i + 1},${j}`);
      const mN = [cx, y0], mS = [cx, y0 + c], mW = [x0, cy], mE = [x0 + c, cy];
      const t = rng.chance(pc) ? 2 : rng.chance(0.5) ? 0 : 1;
      if (t === 0) {
        segs.push({ d: arc(mN, mW, [x0, y0]), n: N }); union(N, Wn);
        segs.push({ d: arc(mS, mE, [x0 + c, y0 + c]), n: S }); union(S, E);
      } else if (t === 1) {
        segs.push({ d: arc(mN, mE, [x0 + c, y0]), n: N }); union(N, E);
        segs.push({ d: arc(mS, mW, [x0, y0 + c]), n: S }); union(S, Wn);
      } else {
        const vertOver = rng.chance(0.5);
        const under = vertOver ? [mW, mE] : [mN, mS], over = vertOver ? [mN, mS] : [mW, mE];
        segs.push({ d: ctx.pathL(under), n: vertOver ? Wn : N });
        segs.push({ over, n: vertOver ? N : Wn });
        union(Wn, E); union(N, S);
      }
    }
    // colour whole threads: the longest few, plus a sprinkle
    const size = new Map();
    for (const s of segs) { const r = find(s.n); size.set(r, (size.get(r) || 0) + 1); }
    const ranked = [...size].sort((a, b) => b[1] - a[1]);
    const color = new Map();
    const top = rng.int(2, 4);
    ranked.slice(0, top).forEach(([r], i) => { const col = ctx.accent(i); if (col) color.set(r, col); });
    for (const [r, n] of ranked.slice(top)) if (n > 5 && rng.chance(0.05)) { const col = ctx.accent(rng.int(0, 1)); if (col) color.set(r, col); }

    const base = segs.filter(s => !s.over).map(s => ({ d: s.d, color: color.get(find(s.n)) }));
    let out = ctx.cased(base);
    const overs = segs.filter(s => s.over);
    const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
    out += `<g fill="none" stroke="${ctx.pal.ink}" stroke-width="${ctx.lw + 2 * ctx.bw}" stroke-linecap="butt"><path d="${overs.map(s => ctx.pathL([lerp(s.over[0], s.over[1], 0.2), lerp(s.over[0], s.over[1], 0.8)])).join('')}"/></g>`;
    const byCol = new Map();
    for (const s of overs) { const col = color.get(find(s.n)) || ctx.pal.line; (byCol.get(col) || byCol.set(col, []).get(col)).push(ctx.pathL(s.over)); }
    for (const [col, ds] of byCol) out += `<path fill="none" stroke="${col}" stroke-width="${ctx.lw}" stroke-linecap="butt" d="${ds.join('')}"/>`;
    return out;
  },
});
