// Isometric city of prisms on a street grid; a district lit in colour.
Lab.register({
  id: 'city',
  name: 'Isometric City',
  tagline: 'Architecture, literally',
  concept: 'An isometric city of blocks, setbacks and towers on a street grid, the literal meaning of the word. From far away it has the texture of a circuit board. Up close every block has its own height and face. One district is lit in colour: the part of the estate you own.',
  plate: 'top',
  render(ctx) {
    const { W, H, rng, noise, pal, f1 } = ctx;
    const tw = rng.pick([34, 40, 46]), th = tw / 2, hu = th * rng.range(0.9, 1.2);
    const shadeL = mix => ctx.mix(mix, pal.ink, 0.16), shadeR = mix => ctx.mix(mix, pal.ink, 0.36);
    const streetI = rng.int(4, 7), streetJ = rng.int(4, 7), sc = rng.range(0.05, 0.11);
    const smax = Math.ceil(2 * H / th) + 30, dmax = Math.ceil(W / tw) + 2;
    const poly = (pts, fill) => `<path d="M${pts.map(p => f1(p[0]) + ' ' + f1(p[1])).join('L')}Z" fill="${fill}"/>`;
    const prism = (X, Y, hw, hh, h, top) => {
      // X,Y: ground centre of the footprint; hw,hh: half width/height of the diamond
      const z = h * hu;
      const T = [X, Y - hh - z], R = [X + hw, Y - z], Bm = [X, Y + hh - z], L = [X - hw, Y - z];
      const Rg = [X + hw, Y], Bg = [X, Y + hh], Lg = [X - hw, Y];
      return poly([L, Bm, Bg, Lg], shadeL(top)) + poly([Bm, R, Rg, Bg], shadeR(top)) + poly([T, R, Bm, L], top);
    };
    let out = `<g stroke="${pal.ink}" stroke-width="${ctx.bw}" stroke-linejoin="round">`;
    for (let s = -4; s < smax; s++) {
      for (let d = -dmax; d <= dmax; d++) {
        if ((s + d) & 1) continue;
        const i = (s + d) / 2, j = (s - d) / 2;
        const X = W / 2 + d * tw / 2, Y = s * th / 2;
        if (X < -tw || X > W + tw || Y < -th || Y > H + 40 * hu) continue;
        const onStreet = ((i % streetI) + streetI) % streetI === 0 || ((j % streetJ) + streetJ) % streetJ === 0;
        if (onStreet) continue;
        if (!ctx.free(X, Y, 14)) continue;
        const n = noise.fbm(i * sc, j * sc, 3);
        let h = Math.max(0, Math.floor((n + 0.35) * 7 + rng.range(-1, 1.5)));
        if (rng.chance(0.025)) h += rng.int(5, 12);
        if (h <= 0) { if (rng.chance(0.18)) out += prism(X, Y, tw / 2, th / 2, 0.25, pal.line); continue; }
        const zc = ctx.zone(X, Y - h * hu / 2);
        const top = zc || pal.line;
        out += prism(X, Y, tw / 2, th / 2, h, top);
        if (h >= 4 && rng.chance(0.4)) {
          const k = rng.range(0.45, 0.7), h2 = rng.int(1, Math.max(1, Math.floor(h / 2)));
          out += prism(X, Y - h * hu, tw / 2 * k, th / 2 * k, h2, zc && rng.chance(0.5) ? pal.line : top);
        }
      }
    }
    return out + '</g>';
  },
});
