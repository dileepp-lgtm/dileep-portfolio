/* ============================================================
   CursorGrid — vanilla port of the React Bits <CursorGrid /> component.
   Same rendering logic (falloff curves, hold + fade, click pulses),
   rewritten without React so it can drop into this static site.

   Usage: CursorGrid.mount(hostEl, { ...options })
   The canvas is pointer-events:none; pointer input is read from the host,
   so links and buttons inside the hero stay clickable.
   ============================================================ */
(function (global) {
  'use strict';

  var FALLOFF_CURVES = {
    linear: function (t) { return t; },
    smooth: function (t) { return t * t * (3 - 2 * t); },
    sharp:  function (t) { return t * t * t; }
  };

  function hexToRgb(hex) {
    var h = String(hex).replace('#', '');
    var v = h.length === 3 ? h.split('').map(function (c) { return c + c; }).join('') : h;
    var num = parseInt(v.slice(0, 6), 16);
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
  }

  var DEFAULTS = {
    cellSize: 70,
    color: '#D946EF',
    radius: 140,
    falloff: 'smooth',
    holdTime: 400,
    fadeDuration: 800,
    lineWidth: 1.2,
    maxOpacity: 1,
    fillOpacity: 0,
    gridOpacity: 0,
    cellRadius: 0,
    clickPulse: true,
    pulseSpeed: 600,
    className: ''
  };

  function mount(host, options) {
    if (!host) return null;

    // Respect reduced motion, and skip on touch-only devices (no cursor to follow)
    var reduce = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var hasHover = !global.matchMedia || global.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (reduce || !hasHover) return null;

    var p = {};
    Object.keys(DEFAULTS).forEach(function (k) { p[k] = DEFAULTS[k]; });
    Object.keys(options || {}).forEach(function (k) { p[k] = options[k]; });

    var container = document.createElement('div');
    container.className = 'cursor-grid' + (p.className ? ' ' + p.className : '');
    container.setAttribute('aria-hidden', 'true');
    var canvas = document.createElement('canvas');
    canvas.className = 'cursor-grid__canvas';
    container.appendChild(canvas);
    host.appendChild(container);

    var ctx = canvas.getContext('2d');
    if (!ctx) { container.remove(); return null; }
    var dpr = Math.min(global.devicePixelRatio || 1, 2);
    var canRound = typeof ctx.roundRect === 'function';

    // Grid state: one alpha + timestamp pair per cell, indexed row-major.
    var cols = 0, rows = 0, offX = 0, offY = 0;
    var alphas = new Float32Array(0);
    var touched = new Float64Array(0);
    var w = 0, h = 0;
    var pulses = [];
    var raf = 0, running = false, lastFrame = 0;

    function rebuild() {
      w = container.offsetWidth;
      h = container.offsetHeight;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(w / p.cellSize) + 1;
      rows = Math.ceil(h / p.cellSize) + 1;
      // Center the lattice so edge cells crop evenly on both sides
      offX = (w - cols * p.cellSize) / 2;
      offY = (h - rows * p.cellSize) / 2;
      alphas = new Float32Array(cols * rows);
      touched = new Float64Array(cols * rows);
    }

    function centerX(i) { return offX + (i % cols) * p.cellSize + p.cellSize / 2; }
    function centerY(i) { return offY + Math.floor(i / cols) * p.cellSize + p.cellSize / 2; }

    // Light up every cell whose center falls inside the radius, with the
    // configured falloff curve mapping distance to brightness.
    function energize(x, y, boost) {
      var r = Math.max(p.radius, 1);
      var ease = FALLOFF_CURVES[p.falloff] || FALLOFF_CURVES.linear;
      var now = performance.now();
      var minCol = Math.max(0, Math.floor((x - r - offX) / p.cellSize));
      var maxCol = Math.min(cols - 1, Math.floor((x + r - offX) / p.cellSize));
      var minRow = Math.max(0, Math.floor((y - r - offY) / p.cellSize));
      var maxRow = Math.min(rows - 1, Math.floor((y + r - offY) / p.cellSize));
      for (var cRow = minRow; cRow <= maxRow; cRow++) {
        for (var cCol = minCol; cCol <= maxCol; cCol++) {
          var i = cRow * cols + cCol;
          var dist = Math.hypot(centerX(i) - x, centerY(i) - y);
          if (dist > r) continue;
          var level = ease(1 - dist / r) * p.maxOpacity * (boost == null ? 1 : boost);
          if (level > alphas[i]) { alphas[i] = level; touched[i] = now; }
          else if (level > 0) { touched[i] = now; }
        }
      }
    }

    function draw(now) {
      var dt = Math.min(now - lastFrame, 50);
      lastFrame = now;
      ctx.clearRect(0, 0, w, h);

      var rgb = hexToRgb(p.color), cr = rgb[0], cg = rgb[1], cb = rgb[2];

      // Optional faint static lattice
      if (p.gridOpacity > 0) {
        ctx.strokeStyle = 'rgba(' + cr + ',' + cg + ',' + cb + ',' + p.gridOpacity + ')';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (var gc = 0; gc <= cols; gc++) {
          var gx = Math.round(offX + gc * p.cellSize) + 0.5;
          ctx.moveTo(gx, 0); ctx.lineTo(gx, h);
        }
        for (var gr = 0; gr <= rows; gr++) {
          var gy = Math.round(offY + gr * p.cellSize) + 0.5;
          ctx.moveTo(0, gy); ctx.lineTo(w, gy);
        }
        ctx.stroke();
      }

      // Expanding click pulses hand their energy to cells as they pass
      for (var pi = pulses.length - 1; pi >= 0; pi--) {
        var pulse = pulses[pi];
        var ringR = ((now - pulse.t0) / 1000) * p.pulseSpeed;
        if (ringR > Math.hypot(w, h)) { pulses.splice(pi, 1); continue; }
        var band = p.cellSize;
        var pMinCol = Math.max(0, Math.floor((pulse.x - ringR - band - offX) / p.cellSize));
        var pMaxCol = Math.min(cols - 1, Math.floor((pulse.x + ringR + band - offX) / p.cellSize));
        var pMinRow = Math.max(0, Math.floor((pulse.y - ringR - band - offY) / p.cellSize));
        var pMaxRow = Math.min(rows - 1, Math.floor((pulse.y + ringR + band - offY) / p.cellSize));
        for (var prow = pMinRow; prow <= pMaxRow; prow++) {
          for (var pcol = pMinCol; pcol <= pMaxCol; pcol++) {
            var pIdx = prow * cols + pcol;
            var pDist = Math.hypot(centerX(pIdx) - pulse.x, centerY(pIdx) - pulse.y);
            if (Math.abs(pDist - ringR) < band / 2 && p.maxOpacity > alphas[pIdx]) {
              alphas[pIdx] = p.maxOpacity;
              touched[pIdx] = now;
            }
          }
        }
      }

      var anyVisible = pulses.length > 0;
      var fadeStep = dt / Math.max(p.fadeDuration, 16);
      var half = p.cellSize / 2;

      for (var i = 0; i < alphas.length; i++) {
        var a = alphas[i];
        if (a <= 0) continue;
        if (now - touched[i] > p.holdTime) {
          a = Math.max(0, a - fadeStep);
          alphas[i] = a;
          if (a <= 0) continue;
        }
        anyVisible = true;
        var cx = centerX(i), cy = centerY(i);
        var gradient = ctx.createRadialGradient(cx, cy, half * 0.1, cx, cy, p.cellSize);
        gradient.addColorStop(0, 'rgba(' + cr + ',' + cg + ',' + cb + ',' + a + ')');
        gradient.addColorStop(1, 'rgba(' + cr + ',' + cg + ',' + cb + ',0)');
        var x = cx - half + 0.5, y = cy - half + 0.5, s = p.cellSize - 1;
        ctx.beginPath();
        if (p.cellRadius > 0 && canRound) ctx.roundRect(x, y, s, s, p.cellRadius);
        else ctx.rect(x, y, s, s);
        if (p.fillOpacity > 0) {
          ctx.fillStyle = 'rgba(' + cr + ',' + cg + ',' + cb + ',' + (a * p.fillOpacity) + ')';
          ctx.fill();
        }
        ctx.strokeStyle = gradient;
        ctx.lineWidth = p.lineWidth;
        ctx.stroke();
      }

      if (anyVisible) {
        raf = requestAnimationFrame(draw);
      } else {
        running = false;
        if (p.gridOpacity <= 0) ctx.clearRect(0, 0, w, h);
      }
    }

    function wake() {
      if (running) return;
      running = true;
      lastFrame = performance.now();
      raf = requestAnimationFrame(draw);
    }

    function toLocal(e) {
      var rect = canvas.getBoundingClientRect();
      return [e.clientX - rect.left, e.clientY - rect.top];
    }
    function onPointerMove(e) { var xy = toLocal(e); energize(xy[0], xy[1]); wake(); }
    function onPointerDown(e) {
      if (!p.clickPulse) return;
      var xy = toLocal(e);
      pulses.push({ x: xy[0], y: xy[1], t0: performance.now() });
      wake();
    }

    var ro = new ResizeObserver(function () { rebuild(); wake(); });
    ro.observe(container);
    rebuild();
    wake();

    // Listen on the host so overlaying content stays interactive
    host.addEventListener('pointermove', onPointerMove);
    host.addEventListener('pointerdown', onPointerDown);

    // Pause entirely when the hero is scrolled out of view
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) { cancelAnimationFrame(raf); running = false; }
      });
    }, { threshold: 0 });
    io.observe(container);

    return {
      destroy: function () {
        cancelAnimationFrame(raf);
        ro.disconnect();
        io.disconnect();
        host.removeEventListener('pointermove', onPointerMove);
        host.removeEventListener('pointerdown', onPointerDown);
        container.remove();
      },
      set: function (next) {
        Object.keys(next || {}).forEach(function (k) { p[k] = next[k]; });
        rebuild(); wake();
      }
    };
  }

  global.CursorGrid = { mount: mount };
})(window);
