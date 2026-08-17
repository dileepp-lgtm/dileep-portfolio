/* ============================================================
   SpecularButton — vanilla port of the React Bits <SpecularButton />.

   The original mounts one <canvas> (and one WebGL context) per button via
   `ogl`. Browsers cap concurrent WebGL contexts at ~16, and this page has 19
   buttons, so instead this uses ONE shared full-viewport WebGL2 canvas and
   redraws every registered button's rim each frame with per-button uniforms.
   The shader is the original, unchanged.

   Usage: SpecularButtons.init('.btn, .gfilter, .c-link');
   Per-button colours come from CSS custom properties --spec-line /
   --spec-base, so they follow the light/dark theme automatically.
   ============================================================ */
(function (global) {
  'use strict';

  var PAD = 20;

  var VERT = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

  var FRAG = `#version 300 es
precision highp float;
uniform vec2 uCenter;
uniform vec2 uHalfSize;
uniform float uRadius;
uniform float uAngle;
uniform float uPx;
uniform vec3 uLineColor;
uniform vec3 uBaseColor;
uniform float uIntensity;
uniform float uShineSize;
uniform float uShineFade;
uniform float uThickness;
uniform float uBaseWidth;
uniform float uBaseStrength;
out vec4 fragColor;

float sdRoundedRect(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}
float shapeSDF(vec2 p) { return sdRoundedRect(p, uHalfSize, uRadius); }
float gaussianLine(float d, float sigma) {
  float x = d / (sigma + 1e-6);
  float k = mix(1.0, 1.6, smoothstep(0.0, 1.5, x));
  return exp(-k * x * x);
}
void main() {
  vec2 p = gl_FragCoord.xy - uCenter;
  float d = shapeSDF(p);
  vec2 L = vec2(cos(uAngle), sin(uAngle));
  // Dark base stroke hugging the edge for a sense of thickness
  float base = (1.0 - smoothstep(0.0, uBaseWidth, abs(d))) * uBaseStrength;
  // Symmetric specular: the edges facing toward/away from the light both
  // catch a streak. The angular window (size + fade) is measured with an
  // elliptical normal so it varies continuously along straight edges.
  vec2 nEll = normalize(p / (uHalfSize * uHalfSize) + 1e-6);
  float phi = acos(clamp(abs(dot(nEll, L)), 0.0, 1.0));
  float rim = 1.0 - smoothstep(uShineSize - uShineFade, uShineSize + uShineFade + 1e-4, phi);
  float line = gaussianLine(d, uThickness);
  float edgeClamp = 1.0 - smoothstep(0.5 * uPx, 3.0 * uPx, abs(d));
  float hi = line * rim * edgeClamp * uIntensity;
  vec3 col = uBaseColor * base + uLineColor * hi;
  float a = clamp(base + hi, 0.0, 1.0);
  fragColor = vec4(col, a);
}
`;

  var DEFAULTS = {
    radius: 999,        // clamps to a pill, matching the site's button shape
    lineColor: '#ffffff',
    baseColor: '#525252',
    baseStrength: 0.22,
    intensity: 1,
    shineSize: 10,
    shineFade: 40,
    thickness: 1,
    speed: 0.35,
    followMouse: true,
    proximity: 250,
    autoAnimate: false
  };

  function hexToRgb01(str) {
    var s = String(str).trim();
    if (s.charAt(0) === '#') {
      var h = s.slice(1);
      if (h.length === 3) h = h.split('').map(function (c) { return c + c; }).join('');
      var n = parseInt(h.slice(0, 6), 16);
      return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
    }
    var m = s.match(/rgba?\(([^)]+)\)/);
    if (m) {
      var parts = m[1].split(',').map(parseFloat);
      return [parts[0] / 255, parts[1] / 255, parts[2] / 255];
    }
    return [1, 1, 1];
  }

  function compile(gl, type, src) {
    var sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      console.warn('SpecularButtons shader error:', gl.getShaderInfoLog(sh));
      gl.deleteShader(sh);
      return null;
    }
    return sh;
  }

  function init(selector, options) {
    var reduce = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var hasHover = !global.matchMedia || global.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (reduce || !hasHover) return null;

    var els = Array.prototype.slice.call(document.querySelectorAll(selector));
    if (!els.length) return null;

    var canvas = document.createElement('canvas');
    canvas.className = 'specular-layer';
    canvas.setAttribute('aria-hidden', 'true');
    var gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: true });
    if (!gl) return null;                       // graceful no-op without WebGL2
    document.body.appendChild(canvas);

    var vs = compile(gl, gl.VERTEX_SHADER, VERT);
    var fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) { canvas.remove(); return null; }
    var prog = gl.createProgram();
    gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { canvas.remove(); return null; }
    gl.useProgram(prog);

    // Full-viewport triangle
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, 'position');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    var U = {};
    ['uCenter','uHalfSize','uRadius','uAngle','uPx','uLineColor','uBaseColor',
     'uIntensity','uShineSize','uShineFade','uThickness','uBaseWidth','uBaseStrength']
      .forEach(function (n) { U[n] = gl.getUniformLocation(prog, n); });

    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.SCISSOR_TEST);

    var dpr = Math.min(global.devicePixelRatio || 1, 2);
    var vw = 0, vh = 0;

    function resizeCanvas() {
      vw = global.innerWidth; vh = global.innerHeight;
      canvas.width = Math.round(vw * dpr);
      canvas.height = Math.round(vh * dpr);
      canvas.style.width = vw + 'px';
      canvas.style.height = vh + 'px';
    }
    resizeCanvas();
    global.addEventListener('resize', resizeCanvas);

    // one state object per button
    var items = els.map(function (el) {
      var cs = getComputedStyle(el);
      var opt = {};
      Object.keys(DEFAULTS).forEach(function (k) { opt[k] = DEFAULTS[k]; });
      Object.keys(options || {}).forEach(function (k) { opt[k] = options[k]; });
      var line = cs.getPropertyValue('--spec-line').trim();
      var base = cs.getPropertyValue('--spec-base').trim();
      if (line) opt.lineColor = line;
      if (base) opt.baseColor = base;
      return { el: el, opt: opt, angle: 2.4, idle: 2.4, bright: 0, pointerAngle: null, prox: 0, rect: null };
    });

    // refresh theme-driven colours when the theme flips
    var themeObserver = new MutationObserver(function () {
      items.forEach(function (it) {
        var cs = getComputedStyle(it.el);
        var line = cs.getPropertyValue('--spec-line').trim();
        var base = cs.getPropertyValue('--spec-base').trim();
        if (line) it.opt.lineColor = line;
        if (base) it.opt.baseColor = base;
      });
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    function onPointerMove(e) {
      for (var i = 0; i < items.length; i++) {
        var it = items[i];
        var rect = it.el.getBoundingClientRect();
        if (!rect.width) { it.prox = 0; continue; }
        var cx = rect.left + rect.width / 2;
        var cy = rect.top + rect.height / 2;
        var dx = Math.max(rect.left - e.clientX, 0, e.clientX - rect.right);
        var dy = Math.max(rect.top - e.clientY, 0, e.clientY - rect.bottom);
        var dist = Math.hypot(dx, dy);
        if (dist > it.opt.proximity) { it.prox = 0; continue; }   // cheap early-out
        // Over the button itself the light settles on the diagonal (framing the
        // corners) and gently sways with the cursor position within the button.
        if (dist === 0) {
          var nx = (e.clientX - cx) / (rect.width / 2);
          var ny = (cy - e.clientY) / (rect.height / 2);
          it.pointerAngle = Math.atan2(2 / rect.height, -2 / rect.width) + nx * 0.3 + ny * 0.15;
        } else {
          it.pointerAngle = Math.atan2(cy - e.clientY, e.clientX - cx);
        }
        var t = Math.max(0, 1 - dist / Math.max(it.opt.proximity, 1));
        it.prox = t * t * (3 - 2 * t);
      }
      wake();
    }
    global.addEventListener('pointermove', onPointerMove, { passive: true });

    var raf = 0, running = false, last = 0;

    function frame(now) {
      var dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.scissor(0, 0, canvas.width, canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT);

      var alive = false;

      for (var i = 0; i < items.length; i++) {
        var it = items[i], p = it.opt;
        var rect = it.el.getBoundingClientRect();
        if (!rect.width || rect.bottom < -PAD || rect.top > vh + PAD) { it.bright = 0; continue; }
        // don't draw a rim for a button that is itself hidden (e.g. back-to-top
        // before you scroll). getComputedStyle is throttled to avoid style thrash.
        if (now - (it.visCheck || 0) > 250) {
          var vcs = getComputedStyle(it.el);
          it.hidden = vcs.visibility === 'hidden' || parseFloat(vcs.opacity) < 0.05 || vcs.display === 'none';
          it.visCheck = now;
        }
        if (it.hidden) { it.bright = 0; continue; }

        it.idle += p.speed * dt;
        var steer = p.followMouse && it.pointerAngle != null && (!p.autoAnimate || it.prox > 0);
        var target = steer ? it.pointerAngle : it.idle;
        var diff = ((target - it.angle + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
        it.angle += diff * (1 - Math.exp(-dt * 7));
        // Shine fades in with pointer proximity unless autoAnimate keeps it on
        var brightTarget = p.autoAnimate ? 1 : it.prox;
        it.bright += (brightTarget - it.bright) * (1 - Math.exp(-dt * 8));
        if (it.bright > 0.002) alive = true; else continue;

        // padded box, converted to framebuffer pixels (WebGL origin is bottom-left)
        var bx = Math.floor((rect.left - PAD) * dpr);
        var by = Math.floor((vh - rect.bottom - PAD) * dpr);
        var bw = Math.ceil((rect.width + PAD * 2) * dpr);
        var bh = Math.ceil((rect.height + PAD * 2) * dpr);
        gl.viewport(bx, by, bw, bh);
        gl.scissor(bx, by, bw, bh);

        var lc = hexToRgb01(p.lineColor), bc = hexToRgb01(p.baseColor);
        // gl_FragCoord is framebuffer-absolute, so the centre is too
        gl.uniform2f(U.uCenter, (rect.left + rect.width / 2) * dpr, (vh - rect.top - rect.height / 2) * dpr);
        gl.uniform2f(U.uHalfSize, (rect.width / 2) * dpr, (rect.height / 2) * dpr);
        gl.uniform1f(U.uRadius, Math.min(p.radius, Math.min(rect.width, rect.height) / 2) * dpr);
        gl.uniform1f(U.uAngle, it.angle);
        gl.uniform1f(U.uPx, dpr);
        gl.uniform3f(U.uLineColor, lc[0], lc[1], lc[2]);
        gl.uniform3f(U.uBaseColor, bc[0], bc[1], bc[2]);
        gl.uniform1f(U.uIntensity, p.intensity * it.bright);
        gl.uniform1f(U.uShineSize, (p.shineSize * Math.PI) / 180);
        gl.uniform1f(U.uShineFade, (p.shineFade * Math.PI) / 180);
        gl.uniform1f(U.uThickness, p.thickness * dpr);
        gl.uniform1f(U.uBaseWidth, dpr);
        gl.uniform1f(U.uBaseStrength, p.baseStrength * it.bright);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }

      if (alive) { raf = requestAnimationFrame(frame); }
      else { running = false; }
    }

    function wake() {
      if (running) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }

    return {
      add: function (el) {
        var cs = getComputedStyle(el), opt = {};
        Object.keys(DEFAULTS).forEach(function (k) { opt[k] = DEFAULTS[k]; });
        var line = cs.getPropertyValue('--spec-line').trim();
        if (line) opt.lineColor = line;
        items.push({ el: el, opt: opt, angle: 2.4, idle: 2.4, bright: 0, pointerAngle: null, prox: 0 });
      },
      destroy: function () {
        cancelAnimationFrame(raf);
        themeObserver.disconnect();
        global.removeEventListener('pointermove', onPointerMove);
        global.removeEventListener('resize', resizeCanvas);
        var ext = gl.getExtension('WEBGL_lose_context');
        if (ext) ext.loseContext();
        canvas.remove();
      }
    };
  }

  global.SpecularButtons = { init: init };
})(window);
