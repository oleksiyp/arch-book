/* Book3D: a CSS-3D paperback that fits its container, turns under drag/swipe/tilt with
   inertia, is lit so faces shade as they turn, and opens its front cover on tap to reveal
   a title page. Shared by the site header and cover-lab (keep the two copies in sync).

   Book3D.create(host, {
     wrap: { url, W, H, front:{x,y,w,h}, back:{...}, spine:{...} },  // one print-wrap image, cropped per face
     // or front/back/spine: HTML strings for each face
     aspect: 1.5, depth: spineW / trimW, margin: 0.15,
     titlePage: HTML shown when the cover opens (omit to disable opening),
     intro: true, idle: true, tilt: true, compact: false, onTap: fn (overrides opening),
   }) -> { turnTo, open, close, destroy } */
(function () {
  'use strict';
  var CSS = [
    '.b3d{position:relative;width:100%;height:100%;perspective:2400px;perspective-origin:50% 40%;touch-action:pan-y;cursor:grab;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent;outline:none}',
    '.b3d:focus-visible{box-shadow:inset 0 0 0 2px rgba(0,201,255,.8);border-radius:8px}',
    '.b3d.is-dragging{cursor:grabbing}',
    '.b3d-floor{position:absolute;left:50%;border-radius:50%;background:radial-gradient(closest-side,rgba(0,0,0,.38),rgba(0,0,0,.14) 60%,rgba(0,0,0,0));transform:translateX(-50%);pointer-events:none}',
    '.b3d-book{position:absolute;left:50%;top:50%;transform-style:preserve-3d}',
    '.b3d-face{position:absolute;left:0;top:0;overflow:hidden;backface-visibility:hidden;-webkit-backface-visibility:hidden}',
    '.b3d-art{position:absolute;inset:0;background-repeat:no-repeat}',
    '.b3d-art>svg{display:block;width:100%;height:100%}',
    '.b3d-shade{position:absolute;inset:0;background:#000;pointer-events:none}',
    '.b3d-cover{position:absolute;left:0;top:0;transform-style:preserve-3d;transform-origin:0 50%}',
    '.b3d-front{border-radius:0 2px 2px 0}',
    '.b3d-hinge{position:absolute;inset:0;pointer-events:none;background:linear-gradient(90deg,rgba(0,0,0,.28) 0,rgba(255,255,255,.22) 1.1%,rgba(0,0,0,.10) 2.4%,rgba(0,0,0,0) 5%)}',
    '.b3d-sheen{position:absolute;inset:-20%;pointer-events:none;mix-blend-mode:soft-light;background:linear-gradient(105deg,rgba(255,255,255,0) 30%,rgba(255,255,255,.6) 45%,rgba(255,255,255,0) 60%)}',
    '.b3d-inner{background:#F4F1EA;transform:rotateY(180deg)}',
    '.b3d-inner::after{content:"";position:absolute;inset:0;background:linear-gradient(270deg,rgba(0,0,0,.18),rgba(0,0,0,0) 8%)}',
    '.b3d-endpaper{position:absolute;inset:0;opacity:.13;filter:grayscale(1)}',
    '.b3d-title{background:#FBF9F3;box-shadow:inset 6px 0 14px -8px rgba(0,0,0,.35)}',
    '.b3d-pages{background:linear-gradient(90deg,rgba(60,50,30,.28),rgba(60,50,30,0) 18%,rgba(60,50,30,0) 82%,rgba(60,50,30,.22)),repeating-linear-gradient(90deg,#FBF8F0 0 .9px,#C9C1AE .9px 1.5px,#EFEADF 1.5px 2.4px);box-shadow:inset 0 0 0 1px rgba(40,30,15,.35)}',
    '.b3d-topedge,.b3d-bottomedge{background:linear-gradient(0deg,rgba(60,50,30,.25),rgba(60,50,30,0) 20%,rgba(60,50,30,0) 80%,rgba(60,50,30,.2)),repeating-linear-gradient(0deg,#FBF8F0 0 .9px,#C9C1AE .9px 1.5px,#EFEADF 1.5px 2.4px);box-shadow:inset 0 0 0 1px rgba(40,30,15,.35)}'
  ].join('\n');
  var styled = false;
  var L = (function () { var v = [0.4, -0.5, 0.8], l = Math.hypot(v[0], v[1], v[2]); return [v[0] / l, v[1] / l, v[2] / l]; })();
  var reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ease = function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  var easeOutBack = function (t) { var c = 1.3; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };

  function crop(wrap, r) {
    // background sized so the wrap image's r-rectangle fills the face exactly
    var sx = (wrap.W - r.w) ? r.x / (wrap.W - r.w) * 100 : 0, sy = (wrap.H - r.h) ? r.y / (wrap.H - r.h) * 100 : 0;
    return '<div class="b3d-art" style="background-image:url(\'' + wrap.url + '\');background-size:' + (wrap.W / r.w * 100) + '% auto;background-position:' + sx + '% ' + sy + '%"></div>';
  }

  function create(host, o) {
    if (!styled) { var s = document.createElement('style'); s.textContent = CSS; document.head.appendChild(s); styled = true; }
    var opt = { aspect: 1.5, depth: 0.15, margin: 0.15, ry: 28, rx: -10, intro: true, idle: true, tilt: true };
    for (var k in o) opt[k] = o[k];
    var art = function (part) { return opt.wrap ? crop(opt.wrap, opt.wrap[part]) : '<div class="b3d-art">' + (opt[part] || '') + '</div>'; };
    var canOpen = !!opt.titlePage && !opt.onTap;
    var endpaper = function () {
      if (!opt.wrap) return '';
      var b = opt.wrap.back, h = b.h * 0.4, w = h / opt.aspect;
      return crop(opt.wrap, { x: b.x, y: b.y + b.h - h, w: w, h: h });
    };
    host.innerHTML = '<div class="b3d" tabindex="0" role="button"><div class="b3d-floor"></div><div class="b3d-book">' +
      '<div class="b3d-face b3d-back">' + art('back') + '<div class="b3d-shade"></div></div>' +
      '<div class="b3d-face b3d-pages"><div class="b3d-shade"></div></div>' +
      '<div class="b3d-face b3d-topedge"><div class="b3d-shade"></div></div>' +
      '<div class="b3d-face b3d-bottomedge"><div class="b3d-shade"></div></div>' +
      '<div class="b3d-face b3d-spine">' + art('spine') + '<div class="b3d-shade"></div></div>' +
      (canOpen ? '<div class="b3d-face b3d-title">' + opt.titlePage + '<div class="b3d-shade"></div></div>' : '') +
      '<div class="b3d-cover">' +
      '<div class="b3d-face b3d-front">' + art('front') + '<div class="b3d-hinge"></div><div class="b3d-sheen"></div><div class="b3d-shade"></div></div>' +
      (canOpen ? '<div class="b3d-face b3d-inner"><div class="b3d-endpaper">' + endpaper() + '</div><div class="b3d-shade"></div></div>' : '') +
      '</div></div></div>';
    var root = host.firstElementChild, book = root.querySelector('.b3d-book'), floor = root.querySelector('.b3d-floor');
    var cover = root.querySelector('.b3d-cover'), sheen = root.querySelector('.b3d-sheen');
    root.setAttribute('aria-label', opt.label || (canOpen ? 'The book. Press Enter to open the cover; arrow keys turn it.' : 'The book cover. Arrow keys turn it.'));
    var q = function (sel) { return root.querySelector(sel); };
    // [element, normal in book space, part of the cover?]
    var faces = [[q('.b3d-front'), [0, 0, 1], 1], [q('.b3d-back'), [0, 0, -1], 0], [q('.b3d-spine'), [-1, 0, 0], 0],
      [q('.b3d-pages'), [1, 0, 0], 0], [q('.b3d-topedge'), [0, -1, 0], 0], [q('.b3d-bottomedge'), [0, 1, 0], 0]];
    if (canOpen) faces.push([q('.b3d-title'), [0, 0, 1], 0], [q('.b3d-inner'), [0, 0, -1], 1]);
    var W = 0, H = 0, D = 0, CW = 0;
    var ry = opt.ry, rx = opt.rx, op = 0, vy = 0, vx = 0;
    var anim = null, idleT0 = performance.now(), visible = true, gyro = null, isOpen = false;

    function layout() {
      var cw = root.clientWidth, ch = root.clientHeight;
      if (!cw || !ch) return;
      CW = cw;
      var fit = 1 - 2 * opt.margin;
      H = Math.min(ch * fit, cw * fit * opt.aspect / (1 + opt.depth * 0.8));
      W = H / opt.aspect; D = W * opt.depth;
      var inset = Math.max(1, W * 0.006);
      var st = function (el, css) { for (var p in css) el.style[p] = css[p]; };
      st(book, { width: W + 'px', height: H + 'px', marginLeft: -W / 2 + 'px', marginTop: -H / 2 + 'px' });
      st(cover, { width: W + 'px', height: H + 'px' });
      st(faces[0][0], { width: W + 'px', height: H + 'px' });
      st(faces[1][0], { width: W + 'px', height: H + 'px', transform: 'rotateY(180deg) translateZ(' + D / 2 + 'px)' });
      st(faces[2][0], { width: D + 'px', height: H + 'px', left: -D / 2 + 'px', transform: 'rotateY(-90deg)' });
      st(faces[3][0], { width: D - 2 + 'px', height: H - 2 * inset + 'px', top: inset + 'px', left: W - D / 2 - inset + 1 + 'px', transform: 'rotateY(90deg)' });
      st(faces[4][0], { width: W - inset + 'px', height: D - 2 + 'px', top: -D / 2 + inset + 1 + 'px', transform: 'rotateX(90deg)' });
      st(faces[5][0], { width: W - inset + 'px', height: D - 2 + 'px', top: H - D / 2 - inset - 1 + 'px', transform: 'rotateX(-90deg)' });
      if (canOpen) {
        st(faces[6][0], { width: W - inset + 'px', height: H - 2 * inset + 'px', top: inset + 'px', transform: 'translateZ(' + (D / 2 - 1) + 'px)', fontSize: W / 20 + 'px' });
        st(faces[7][0], { width: W + 'px', height: H + 'px' });
      }
      st(floor, { width: W * 1.3 + 'px', height: Math.max(14, D * 0.9) + 'px', top: (ch / 2 + H / 2 - Math.max(7, D * 0.35)) + 'px' });
      render();
    }
    function lit(n, a, b, c) {
      // rotate the normal by the cover's opening (c), then the book's Y (a) and X (b) turns
      var x0 = n[0] * Math.cos(c) + n[2] * Math.sin(c), z0 = -n[0] * Math.sin(c) + n[2] * Math.cos(c);
      var x1 = x0 * Math.cos(a) + z0 * Math.sin(a), z1 = -x0 * Math.sin(a) + z0 * Math.cos(a), y1 = n[1];
      var y2 = y1 * Math.cos(b) - z1 * Math.sin(b), z2 = y1 * Math.sin(b) + z1 * Math.cos(b);
      return Math.max(0, x1 * L[0] + y2 * L[1] + z2 * L[2]);
    }
    function render() {
      var fitOpen = Math.min(1, CW * 0.94 / (2 * W + D)), sc = 1 - op * (1 - fitOpen), shift = op * W * 0.5 * sc;
      book.style.transform = 'translateX(' + shift + 'px) scale(' + sc + ') rotateX(' + rx + 'deg) rotateY(' + ry + 'deg)';
      var openDeg = -165 * op;
      cover.style.transform = 'translateZ(' + D / 2 + 'px) rotateY(' + openDeg + 'deg)';
      var a = ry * Math.PI / 180, b = rx * Math.PI / 180, c = openDeg * Math.PI / 180;
      for (var i = 0; i < faces.length; i++) {
        var f = faces[i], amb = f[1][0] || f[1][1] ? 0.42 : 0.5;
        f[0].lastElementChild.style.opacity = (1 - (amb + (1 - amb) * lit(f[1], a, b, f[2] ? c : 0))) * 0.6;
      }
      sheen.style.transform = 'translateX(' + (-ry / 90) * 60 + '%)';
      sheen.style.opacity = String(0.35 + 0.4 * Math.max(0, Math.cos(a)));
      floor.style.opacity = String(0.55 + 0.45 * Math.abs(Math.cos(a)));
      floor.style.transform = 'translateX(calc(-50% + ' + shift + 'px)) scaleX(' + (1 + op * 0.9) * sc + ')';
    }
    function stop() { if (anim) cancelAnimationFrame(anim); anim = null; }
    var clampX = function (v) { return Math.max(-40, Math.min(30, v)); };
    function tween(to, ms, fn, done) {
      stop();
      var from = { ry: ry, rx: rx, op: op }, t0 = performance.now();
      if (to.ry !== undefined) { while (to.ry - from.ry > 180) to.ry -= 360; while (to.ry - from.ry < -180) to.ry += 360; }
      var tick = function (now) {
        var t = Math.min(1, (now - t0) / (reduced ? 1 : ms)), e = (fn || ease)(t);
        if (to.ry !== undefined) ry = from.ry + (to.ry - from.ry) * e;
        if (to.rx !== undefined) rx = from.rx + (to.rx - from.rx) * e;
        if (to.op !== undefined) op = from.op + (to.op - from.op) * Math.min(1, Math.max(0, ease(t)));
        render();
        if (t < 1) anim = requestAnimationFrame(tick); else { anim = null; idleT0 = performance.now(); if (done) done(); }
      };
      anim = requestAnimationFrame(tick);
    }
    function turnTo(y, x, ms) { tween({ ry: y, rx: x === undefined ? opt.rx : x }, ms || 700); }
    function openBook() { if (!canOpen) return; isOpen = true; root.setAttribute('aria-expanded', 'true'); tween({ ry: 6, rx: -6, op: 1 }, 1100); }
    function closeBook() { isOpen = false; root.setAttribute('aria-expanded', 'false'); tween({ ry: opt.ry, rx: opt.rx, op: 0 }, 900); }
    function inertia() {
      stop();
      var tick = function () {
        vy *= 0.94; vx *= 0.9; ry += vy; rx = clampX(rx + vx); render();
        if (Math.abs(vy) > 0.02 || Math.abs(vx) > 0.02) anim = requestAnimationFrame(tick); else { anim = null; idleT0 = performance.now(); }
      };
      anim = requestAnimationFrame(tick);
    }
    // Idle sway and phone tilt share one loop that only runs while the book is on screen.
    var loopId = null;
    function loop(now) {
      loopId = requestAnimationFrame(loop);
      if (anim || drag || !visible || document.hidden) return;
      if (gyro) {
        var ty = (isOpen ? 6 : opt.ry) + gyro.g * 0.9, tx = clampX((isOpen ? -6 : opt.rx) - (gyro.b - 45) * 0.35);
        ry += (ty - ry) * 0.08; rx += (tx - rx) * 0.08; render();
      } else if (opt.idle && !reduced && !isOpen && now - idleT0 > 2500) {
        var t = (now - idleT0 - 2500) / 1000, k = Math.min(1, t / 2);
        var ty2 = opt.ry + Math.sin(t * 0.7) * 9 * k, tx2 = opt.rx + Math.sin(t * 0.45) * 2.5 * k;
        ry += (ty2 - ry) * 0.05; rx += (tx2 - rx) * 0.05; render();
      }
    }
    function onOrient(e) { if (e.gamma === null) return; gyro = { g: Math.max(-35, Math.min(35, e.gamma)), b: Math.max(0, Math.min(90, e.beta || 45)) }; }
    function enableTilt() {
      if (!opt.tilt || gyro || !window.DeviceOrientationEvent) return;
      var D0 = window.DeviceOrientationEvent;
      if (typeof D0.requestPermission === 'function') {
        D0.requestPermission().then(function (r) { if (r === 'granted') addEventListener('deviceorientation', onOrient); }).catch(function () { });
      } else addEventListener('deviceorientation', onOrient);
    }
    // phones without a permission prompt get tilt immediately
    if (opt.tilt && window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission !== 'function' && matchMedia('(pointer: coarse)').matches) enableTilt();

    var drag = null, moved = 0;
    root.addEventListener('pointerdown', function (e) {
      if (e.button) return;
      drag = { x: e.clientX, y: e.clientY, t: performance.now(), id: e.pointerId, captured: false }; moved = 0; vy = vx = 0;
    });
    root.addEventListener('pointermove', function (e) {
      if (!drag) return;
      var dx = e.clientX - drag.x, dy = e.clientY - drag.y, dt = Math.max(8, performance.now() - drag.t);
      moved += Math.abs(dx) + Math.abs(dy);
      if (moved < 6) return;
      if (!drag.captured) {
        // vertical swipes on touch screens scroll the page; horizontal ones turn the book
        if (e.pointerType === 'touch' && Math.abs(dy) > Math.abs(dx) * 1.2 && moved < 20) { drag = null; return; }
        stop(); root.setPointerCapture(drag.id); drag.captured = true; root.classList.add('is-dragging');
      }
      var k = 260 / Math.max(160, W);
      ry += dx * 0.5 * k; rx = clampX(rx - dy * 0.3 * k);
      vy = dx * 0.5 * k * 16 / dt; vx = -dy * 0.3 * k * 16 / dt;
      drag.x = e.clientX; drag.y = e.clientY; drag.t = performance.now();
      render();
    });
    function end(e) {
      if (!drag) return;
      var wasDrag = drag.captured; drag = null; root.classList.remove('is-dragging');
      if (wasDrag) { inertia(); return; }
      if (e.type === 'pointercancel') return;
      // a tap: follow a link on the title page, or open/close the book
      var link = e.target.closest && e.target.closest('a');
      if (link) return;
      enableTilt();
      if (opt.onTap) opt.onTap();
      else if (canOpen) (isOpen ? closeBook : openBook)();
      else turnTo(ry + 180);
    }
    root.addEventListener('pointerup', end); root.addEventListener('pointercancel', end);
    root.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (opt.onTap) opt.onTap(); else if (canOpen) (isOpen ? closeBook : openBook)(); }
      else if (e.key === 'ArrowLeft') turnTo(ry - 30, rx, 400);
      else if (e.key === 'ArrowRight') turnTo(ry + 30, rx, 400);
      else if (e.key === 'Escape' && isOpen) closeBook();
    });
    root.addEventListener('dblclick', function (e) { e.preventDefault(); });
    var ro = new ResizeObserver(layout); ro.observe(root);
    var io = window.IntersectionObserver ? new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }) : null;
    if (io) io.observe(root);
    layout();
    if (opt.intro && !reduced) { ry = opt.ry - 200; rx = opt.rx - 6; render(); setTimeout(function () { tween({ ry: opt.ry, rx: opt.rx }, 1700, easeOutBack); }, 250); }
    loopId = requestAnimationFrame(loop);
    return {
      turnTo: turnTo, open: openBook, close: closeBook,
      destroy: function () { stop(); cancelAnimationFrame(loopId); ro.disconnect(); if (io) io.disconnect(); removeEventListener('deviceorientation', onOrient); host.innerHTML = ''; }
    };
  }
  window.Book3D = { create: create };
})();
