'use strict';
(() => {
  const $ = s => document.querySelector(s);
  const store = {
    get(k, d) { try { const v = localStorage.getItem('coverlab.' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('coverlab.' + k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } },
  };
  const DEFAULT_CFG = { palette: 'paper', accents: 'both', weight: '4/2', plateStyle: 'boxed', plate: 'auto', font: 'archivo', spine: 0.9 };
  const state = {
    cfg: { ...DEFAULT_CFG, ...store.get('cfg', {}) },
    seeds: store.get('seeds', {}),
    notes: store.get('notes', {}),
    shortlist: store.get('shortlist', []),
    open: null, view: 'book', ry: 28,
  };
  const designs = Lab.designs;
  const byId = id => designs.find(d => d.id === id);
  const seedOf = id => state.seeds[id] || 1;
  const cfgFor = (id, seed, base = state.cfg) => ({ ...base, seed: seed ?? seedOf(id) });
  const standalone = (() => { try { return window.top === window; } catch (e) { return false; } })();
  const FONT_URL = document.querySelector('link[rel=stylesheet]').href;

  // ---------- rendering helpers
  const mounted = new Set();
  function mount(r) {
    if (mounted.has(r.id)) return;
    $('#defs-g').insertAdjacentHTML('beforeend', `<g id="${r.id}">${r.markup}</g>`);
    mounted.add(r.id);
  }
  function rectOf(r, part) {
    const g = r.geo;
    return part === 'front' ? g.front : part === 'back' ? g.back : part === 'spine' ? g.spine : { x: 0, y: 0, w: g.W, h: g.H };
  }
  function view(r, part, extra = '') {
    const c = rectOf(r, part);
    return `<svg viewBox="${c.x} ${c.y} ${c.w} ${c.h}" preserveAspectRatio="none" role="img" aria-label="${r.design.name}, ${part}"><use href="#${r.id}"/>${extra}</svg>`;
  }
  async function fill(el, design, cfg, part = 'front') {
    el.classList.add('loading');
    const r = await Lab.build(design, cfg);
    mount(r);
    if (el.dataset.want && el.dataset.want !== r.key) return r;
    el.classList.remove('loading');
    el.innerHTML = view(r, part);
    return r;
  }
  function coverEl(design, cfg, part = 'front') {
    const el = document.createElement('div');
    el.className = 'cover';
    el.dataset.want = JSON.stringify([design.id, cfg]);
    fill(el, design, cfg, part);
    return el;
  }
  function gc() {
    const used = new Set([...document.querySelectorAll('use')].map(u => u.getAttribute('href').slice(1)));
    for (const id of [...mounted]) if (!used.has(id)) { document.getElementById(id)?.remove(); mounted.delete(id); }
  }

  // ---------- controls
  function initControls() {
    const opts = (sel, obj, lab) => { $(sel).innerHTML = Object.entries(obj).map(([k, v]) => `<option value="${k}">${lab(k, v)}</option>`).join(''); };
    opts('#c-palette', Lab.PALETTES, (k, v) => v.label);
    opts('#c-accents', Lab.ACCENTS, (k, v) => v);
    opts('#c-weight', Lab.WEIGHTS, k => k.replace('/', ' px / ') + ' px');
    opts('#c-font', Lab.FONTS, (k, v) => v.label);
    for (const k of ['palette', 'accents', 'weight', 'plateStyle', 'plate', 'font']) {
      const el = $('#c-' + k); el.value = state.cfg[k];
      el.addEventListener('change', () => { state.cfg[k] = el.value; changed(); });
    }
    const sp = $('#c-spine');
    const showSpine = v => { $('#o-spine').textContent = `${Number(v).toFixed(2)} in ≈ ${Math.round(v / 0.0025)} pp`; };
    sp.value = state.cfg.spine; showSpine(sp.value);
    sp.addEventListener('input', () => showSpine(sp.value));
    sp.addEventListener('change', () => { state.cfg.spine = Number(sp.value); changed(); });
  }
  function changed() {
    store.set('cfg', state.cfg);
    renderGallery();
    if (state.open) renderDetail();
  }

  // ---------- gallery
  function renderGallery() {
    const g = $('#gallery');
    g.innerHTML = '';
    designs.forEach((d, i) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'card';
      b.appendChild(coverEl(d, cfgFor(d.id)));
      b.insertAdjacentHTML('beforeend', `<div class="meta"><span class="num">No. ${String(i + 1).padStart(2, '0')} · seed ${seedOf(d.id)}</span><h3>${d.name}</h3><p>${d.tagline}</p></div>`);
      b.addEventListener('click', () => open(d.id));
      g.appendChild(b);
    });
    renderShortlist();
    setTimeout(gc, 50);
  }

  // ---------- shortlist
  const sameCfg = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const findSaved = (id, cfg) => state.shortlist.findIndex(s => s.design === id && sameCfg(s.cfg, cfg));
  function renderShortlist() {
    const sec = $('#shortlist'), row = $('#shortlist-row');
    sec.hidden = !state.shortlist.length;
    row.innerHTML = '';
    for (const s of state.shortlist) {
      const d = byId(s.design); if (!d) continue;
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'mini';
      b.appendChild(coverEl(d, s.cfg));
      b.insertAdjacentHTML('beforeend', `<span>${d.name} · ${s.cfg.seed}</span>`);
      b.addEventListener('click', () => {
        const { seed, ...rest } = s.cfg;
        state.cfg = { ...DEFAULT_CFG, ...rest }; state.seeds[d.id] = seed;
        store.set('seeds', state.seeds);
        for (const k of ['palette', 'accents', 'weight', 'plateStyle', 'plate', 'font', 'spine']) $('#c-' + k).value = state.cfg[k];
        $('#c-spine').dispatchEvent(new Event('input'));
        changed(); open(d.id);
      });
      row.appendChild(b);
    }
  }
  $('#copy-shortlist').addEventListener('click', () => copy(JSON.stringify(state.shortlist.map(s => ({ design: s.design, ...s.cfg, note: state.notes[s.design + ':' + s.cfg.seed] || '' })), null, 1), 'Shortlist copied. Paste it to Claude.'));

  // ---------- detail
  function open(id) {
    state.open = id;
    $('#detail').hidden = false;
    document.body.style.overflow = 'hidden';
    try { history.replaceState(null, '', '#' + id); } catch (e) { /* sandboxed */ }
    renderDetail();
    $('#d-close').focus();
  }
  function close() {
    state.open = null;
    $('#detail').hidden = true;
    document.body.style.overflow = '';
    try { history.replaceState(null, '', location.pathname); } catch (e) { /* sandboxed */ }
    renderGallery();
  }
  let current = null;
  async function renderDetail() {
    const d = byId(state.open); if (!d) return;
    const i = designs.indexOf(d), seed = seedOf(d.id), cfg = cfgFor(d.id);
    $('#d-title').innerHTML = `<small>No. ${String(i + 1).padStart(2, '0')}</small>${d.name}`;
    $('#d-concept').textContent = d.concept;
    $('#s-val').textContent = seed;
    $('#d-note').value = state.notes[d.id + ':' + seed] || '';
    const saved = findSaved(d.id, cfg) >= 0;
    $('#d-save').setAttribute('aria-pressed', String(saved));
    $('#d-save').textContent = saved ? 'On shortlist ✓' : 'Add to shortlist';
    $('#d-svg').hidden = !standalone;
    for (const t of document.querySelectorAll('#d-tabs button')) t.setAttribute('aria-selected', String(t.dataset.view === state.view));
    const stage = $('#d-stage');
    if (book) { book.destroy(); book = null; }
    { const [fw, fh] = fitBox(2 / 3); stage.innerHTML = `<div class="cover loading" style="--fw:${fw}px;--fh:${fh}px"></div>`; }
    const want = JSON.stringify([d.id, cfg]);
    stage.dataset.want = want;
    const r = await Lab.build(d, cfg, true);
    if (stage.dataset.want !== want) return;
    mount(r); current = r;
    drawStage(r);
    const g = r.geo;
    $('#d-spec').innerHTML = [
      ['Trim', '6.00 × 9.00 in'], ['Spine', (g.S / 100).toFixed(2) + ' in'], ['Wrap with bleed', `${(g.W / 100).toFixed(3)} × ${(g.H / 100).toFixed(3)} in`],
      ['Line', `${state.cfg.weight.split('/')[0]} u = ${(Number(state.cfg.weight.split('/')[0]) * 0.254).toFixed(2)} mm`], ['Render', r.ms + ' ms'],
    ].map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('');
    // variants
    const vs = $('#d-variants'); vs.innerHTML = '';
    for (let k = 1; k <= 6; k++) {
      const s2 = seed + k, b = document.createElement('button');
      b.type = 'button';
      b.appendChild(coverEl(d, cfgFor(d.id, s2)));
      b.insertAdjacentHTML('beforeend', `<span>seed ${s2}</span>`);
      b.addEventListener('click', () => setSeed(s2));
      vs.appendChild(b);
    }
    setTimeout(gc, 50);
  }
  let book = null;
  function sizeStage() {
    const stage = $('#d-stage');
    const top = stage.getBoundingClientRect().top - $('#detail').getBoundingClientRect().top + $('#detail').scrollTop;
    const narrow = innerWidth <= 900;
    stage.style.setProperty('--stage-h', Math.max(320, innerHeight - top - (narrow ? 12 : 24)) + 'px');
    return { w: stage.clientWidth, h: stage.clientHeight };
  }
  // Fit a box of the given aspect (width / height) into the stage with a 15% margin on every side.
  function fitBox(aspect, reserveH = 0) {
    const { w, h } = sizeStage(), k = 0.7;
    const fh = Math.min((h - reserveH) * k, w * k / aspect);
    return [fh * aspect, fh];
  }
  function drawStage(r) {
    const stage = $('#d-stage'), g = r.geo;
    if (book) { book.destroy(); book = null; }
    if (state.view === 'front' || state.view === 'back') {
      const [fw, fh] = fitBox(2 / 3);
      stage.innerHTML = `<div class="cover" style="--fw:${fw}px;--fh:${fh}px">${view(r, state.view)}</div>`;
    } else if (state.view === 'spread') {
      const [fw, fh] = fitBox(g.W / g.H, 30);
      const B = g.B, sx = g.spine.x, S = g.S;
      const nz = 'vector-effect="non-scaling-stroke"';
      const safe = [g.back, g.front].map(p => `<rect x="${p.x + 25}" y="${p.y + 25}" width="${p.w - 50}" height="${p.h - 50}" ${nz} stroke="#E0218A" stroke-dasharray="3 3"/>`).join('');
      const guides = `<g fill="none" stroke-width="1.2">` +
        `<path d="M0 0H${g.W}V${g.H}H0ZM${B} ${B}V${g.H - B}H${g.W - B}V${B}Z" fill="rgba(20,20,30,.38)" fill-rule="evenodd" stroke="none"/>` +
        `<rect x="${B}" y="${B}" width="${g.W - 2 * B}" height="${g.H - 2 * B}" ${nz} stroke="#00A3D9" stroke-dasharray="6 3"/>` +
        `<path d="M${sx} 0V${g.H}M${sx + S} 0V${g.H}" ${nz} stroke="#7A3CFF" stroke-dasharray="6 3"/>${safe}</g>`;
      stage.innerHTML = `<div class="spread" style="--fw:${fw}px;--fh:${fh}px">${view(r, 'wrap', guides)}<div class="spread-legend">
        <span><i style="color:#00A3D9"></i>trim</span><span><i style="color:#7A3CFF"></i>spine folds</span><span><i style="color:#E0218A"></i>safe area 0.25 in</span><span>shaded: bleed, trimmed off</span></div></div>`;
    } else {
      sizeStage();
      stage.innerHTML = `<div class="bookwrap" id="bookwrap"></div><div class="stage-hint">drag to turn · double-click to reset</div>
        <div class="poses"><button type="button" data-p="0">Front</button><button type="button" data-p="28">Three-quarter</button><button type="button" data-p="75">Spine</button><button type="button" data-p="-60">Fore-edge</button><button type="button" data-p="180">Back</button></div>`;
      book = Book3D.create($('#bookwrap'), { front: view(r, 'front'), back: view(r, 'back'), spine: view(r, 'spine'), aspect: 1.5, depth: g.S / 600, margin: 0.15, ry: state.ry });
      stage.querySelector('.poses').addEventListener('click', e => { const p = e.target.closest('button')?.dataset.p; if (p !== undefined) book.turnTo(Number(p), -10); });
    }
  }
  let resizeT = 0;
  addEventListener('resize', () => { clearTimeout(resizeT); resizeT = setTimeout(() => { if (state.open && current && state.view !== 'book') drawStage(current); else if (state.open) sizeStage(); }, 120); });
  function setSeed(s) {
    if (s < 1) return;
    state.seeds[state.open] = s; store.set('seeds', state.seeds);
    renderDetail();
  }
  function step(dir) {
    const i = designs.findIndex(d => d.id === state.open);
    open(designs[(i + dir + designs.length) % designs.length].id);
  }

  // ---------- actions
  function toast(msg) {
    const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; document.body.appendChild(t);
    setTimeout(() => t.remove(), 2200);
  }
  function copy(text, msg) {
    const fallback = () => {
      const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select();
      let ok = false; try { ok = document.execCommand('copy'); } catch (e) { /* ignore */ }
      ta.remove(); toast(ok ? msg : 'Copy is blocked here. Settings are in the console.'); if (!ok) console.log(text);
    };
    try { navigator.clipboard.writeText(text).then(() => toast(msg), fallback); } catch (e) { fallback(); }
  }
  $('#d-close').addEventListener('click', close);
  $('#d-prev').addEventListener('click', () => step(-1));
  $('#d-next').addEventListener('click', () => step(1));
  $('#s-prev').addEventListener('click', () => setSeed(seedOf(state.open) - 1));
  $('#s-next').addEventListener('click', () => setSeed(seedOf(state.open) + 1));
  $('#s-rand').addEventListener('click', () => setSeed(1 + Math.floor(Math.random() * 9999)));
  $('#d-tabs').addEventListener('click', e => {
    const v = e.target.closest('button')?.dataset.view; if (!v) return;
    state.view = v;
    for (const t of document.querySelectorAll('#d-tabs button')) t.setAttribute('aria-selected', String(t.dataset.view === v));
    if (current) drawStage(current);
  });
  $('#d-note').addEventListener('input', e => {
    const k = state.open + ':' + seedOf(state.open);
    if (e.target.value) state.notes[k] = e.target.value; else delete state.notes[k];
    store.set('notes', state.notes);
  });
  $('#d-save').addEventListener('click', () => {
    const cfg = cfgFor(state.open), i = findSaved(state.open, cfg);
    if (i >= 0) state.shortlist.splice(i, 1); else state.shortlist.push({ design: state.open, cfg, at: Date.now() });
    store.set('shortlist', state.shortlist);
    renderShortlist();
    const saved = i < 0;
    $('#d-save').setAttribute('aria-pressed', String(saved));
    $('#d-save').textContent = saved ? 'On shortlist ✓' : 'Add to shortlist';
    toast(saved ? 'Added to shortlist' : 'Removed from shortlist');
  });
  $('#d-copy').addEventListener('click', () => {
    const cfg = cfgFor(state.open);
    copy(JSON.stringify({ design: state.open, ...cfg, note: state.notes[state.open + ':' + cfg.seed] || '' }), 'Settings copied');
  });
  $('#d-svg').addEventListener('click', () => {
    if (!current) return;
    const g = current.geo;
    const svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${g.W / 100}in" height="${g.H / 100}in" viewBox="0 0 ${g.W} ${g.H}"><style>@import url('${FONT_URL.replace(/&/g, '&amp;')}');</style>${current.markup}</svg>`;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
    a.download = `cover-${current.design.id}-seed${current.cfg.seed}-wrap.svg`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  });
  document.addEventListener('keydown', e => {
    if (!state.open || e.target.closest('textarea, select, input')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowRight') setSeed(seedOf(state.open) + 1);
    else if (e.key === 'ArrowLeft') setSeed(seedOf(state.open) - 1);
  });

  initControls();
  renderGallery();
  const h = location.hash.slice(1);
  if (byId(h)) open(h);
})();
