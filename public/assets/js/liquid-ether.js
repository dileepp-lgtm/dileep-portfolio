/* ============================================================
   LiquidEther — vanilla port of the React Bits <LiquidEther />.

   The simulation itself (Navier–Stokes: advection → external force →
   optional viscosity → divergence → Poisson pressure solve → projection)
   is the component's, unchanged. Only the React shell was removed: refs
   become locals and the two useEffects become mount()/destroy().

   Requires THREE (loaded globally). If THREE is missing this is a no-op,
   so the caller can fall back to a lighter effect.

   Usage: LiquidEther.mount(container, { ...options })
   ============================================================ */
(function (global) {
  'use strict';

  function mount(container, opts) {
    var THREE = global.THREE;
    if (!container || !THREE) return null;

    var reduce = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return null;

    var o = Object.assign({
      mouseForce: 20,
      cursorSize: 100,
      isViscous: false,
      viscous: 30,
      iterationsViscous: 32,
      iterationsPoisson: 32,
      dt: 0.014,
      BFECC: true,
      resolution: 0.5,
      isBounce: false,
      colors: ['#5227FF', '#FF9FFC', '#B497CF'],
      autoDemo: true,
      autoSpeed: 0.5,
      autoIntensity: 2.2,
      takeoverDuration: 0.25,
      autoResumeDelay: 1000,
      autoRampDuration: 0.6
    }, opts || {});

    var rafId = null;
    var isVisible = true;
    var resizeRaf = null;

    function makePaletteTexture(stops) {
      var arr;
      if (Array.isArray(stops) && stops.length > 0) arr = stops.length === 1 ? [stops[0], stops[0]] : stops;
      else arr = ['#ffffff', '#ffffff'];
      var w = arr.length;
      var data = new Uint8Array(w * 4);
      for (var i = 0; i < w; i++) {
        var c = new THREE.Color(arr[i]);
        data[i * 4 + 0] = Math.round(c.r * 255);
        data[i * 4 + 1] = Math.round(c.g * 255);
        data[i * 4 + 2] = Math.round(c.b * 255);
        data[i * 4 + 3] = 255;
      }
      var tex = new THREE.DataTexture(data, w, 1, THREE.RGBAFormat);
      tex.magFilter = THREE.LinearFilter;
      tex.minFilter = THREE.LinearFilter;
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.generateMipmaps = false;
      tex.needsUpdate = true;
      return tex;
    }

    var paletteTex = makePaletteTexture(o.colors);
    var bgVec4 = new THREE.Vector4(0, 0, 0, 0); // always transparent

    /* ---------------- Common ---------------- */
    function CommonClass() {
      this.width = 0; this.height = 0; this.aspect = 1; this.pixelRatio = 1;
      this.time = 0; this.delta = 0;
      this.container = null; this.renderer = null; this.clock = null;
    }
    CommonClass.prototype.init = function (el) {
      this.container = el;
      this.pixelRatio = Math.min(global.devicePixelRatio || 1, 2);
      this.resize();
      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      this.renderer.autoClear = false;
      this.renderer.setClearColor(new THREE.Color(0x000000), 0);
      this.renderer.setPixelRatio(this.pixelRatio);
      this.renderer.setSize(this.width, this.height);
      this.renderer.domElement.style.width = '100%';
      this.renderer.domElement.style.height = '100%';
      this.renderer.domElement.style.display = 'block';
      this.clock = new THREE.Clock();
      this.clock.start();
    };
    CommonClass.prototype.resize = function () {
      if (!this.container) return;
      var rect = this.container.getBoundingClientRect();
      this.width = Math.max(1, Math.floor(rect.width));
      this.height = Math.max(1, Math.floor(rect.height));
      this.aspect = this.width / this.height;
      if (this.renderer) this.renderer.setSize(this.width, this.height, false);
    };
    CommonClass.prototype.update = function () {
      this.delta = this.clock.getDelta();
      this.time += this.delta;
    };
    var Common = new CommonClass();

    /* ---------------- Mouse ---------------- */
    function MouseClass() {
      this.mouseMoved = false;
      this.coords = new THREE.Vector2();
      this.coords_old = new THREE.Vector2();
      this.diff = new THREE.Vector2();
      this.timer = null;
      this.container = null; this.docTarget = null; this.listenerTarget = null;
      this.isHoverInside = false; this.hasUserControl = false; this.isAutoActive = false;
      this.autoIntensity = 2.0;
      this.takeoverActive = false; this.takeoverStartTime = 0; this.takeoverDuration = 0.25;
      this.takeoverFrom = new THREE.Vector2(); this.takeoverTo = new THREE.Vector2();
      this.onInteract = null;
      this._onMouseMove = this.onDocumentMouseMove.bind(this);
      this._onTouchStart = this.onDocumentTouchStart.bind(this);
      this._onTouchMove = this.onDocumentTouchMove.bind(this);
      this._onTouchEnd = this.onTouchEnd.bind(this);
      this._onDocumentLeave = this.onDocumentLeave.bind(this);
    }
    MouseClass.prototype.init = function (el) {
      this.container = el;
      this.docTarget = el.ownerDocument || null;
      var view = (this.docTarget && this.docTarget.defaultView) || global;
      if (!view) return;
      this.listenerTarget = view;
      view.addEventListener('mousemove', this._onMouseMove);
      view.addEventListener('touchstart', this._onTouchStart, { passive: true });
      view.addEventListener('touchmove', this._onTouchMove, { passive: true });
      view.addEventListener('touchend', this._onTouchEnd);
      if (this.docTarget) this.docTarget.addEventListener('mouseleave', this._onDocumentLeave);
    };
    MouseClass.prototype.dispose = function () {
      if (this.listenerTarget) {
        this.listenerTarget.removeEventListener('mousemove', this._onMouseMove);
        this.listenerTarget.removeEventListener('touchstart', this._onTouchStart);
        this.listenerTarget.removeEventListener('touchmove', this._onTouchMove);
        this.listenerTarget.removeEventListener('touchend', this._onTouchEnd);
      }
      if (this.docTarget) this.docTarget.removeEventListener('mouseleave', this._onDocumentLeave);
      this.listenerTarget = null; this.docTarget = null; this.container = null;
    };
    MouseClass.prototype.isPointInside = function (x, y) {
      if (!this.container) return false;
      var r = this.container.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return false;
      return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
    };
    MouseClass.prototype.updateHoverState = function (x, y) {
      this.isHoverInside = this.isPointInside(x, y);
      return this.isHoverInside;
    };
    MouseClass.prototype.setCoords = function (x, y) {
      if (!this.container) return;
      if (this.timer) global.clearTimeout(this.timer);
      var r = this.container.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      var nx = (x - r.left) / r.width, ny = (y - r.top) / r.height;
      this.coords.set(nx * 2 - 1, -(ny * 2 - 1));
      this.mouseMoved = true;
      var self = this;
      this.timer = global.setTimeout(function () { self.mouseMoved = false; }, 100);
    };
    MouseClass.prototype.setNormalized = function (nx, ny) {
      this.coords.set(nx, ny); this.mouseMoved = true;
    };
    MouseClass.prototype.onDocumentMouseMove = function (e) {
      if (!this.updateHoverState(e.clientX, e.clientY)) return;
      if (this.onInteract) this.onInteract();
      if (this.isAutoActive && !this.hasUserControl && !this.takeoverActive) {
        if (!this.container) return;
        var r = this.container.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) return;
        var nx = (e.clientX - r.left) / r.width, ny = (e.clientY - r.top) / r.height;
        this.takeoverFrom.copy(this.coords);
        this.takeoverTo.set(nx * 2 - 1, -(ny * 2 - 1));
        this.takeoverStartTime = performance.now();
        this.takeoverActive = true; this.hasUserControl = true; this.isAutoActive = false;
        return;
      }
      this.setCoords(e.clientX, e.clientY);
      this.hasUserControl = true;
    };
    MouseClass.prototype.onDocumentTouchStart = function (e) {
      if (e.touches.length !== 1) return;
      var t = e.touches[0];
      if (!this.updateHoverState(t.clientX, t.clientY)) return;
      if (this.onInteract) this.onInteract();
      this.setCoords(t.clientX, t.clientY); this.hasUserControl = true;
    };
    MouseClass.prototype.onDocumentTouchMove = function (e) {
      if (e.touches.length !== 1) return;
      var t = e.touches[0];
      if (!this.updateHoverState(t.clientX, t.clientY)) return;
      if (this.onInteract) this.onInteract();
      this.setCoords(t.clientX, t.clientY);
    };
    MouseClass.prototype.onTouchEnd = function () { this.isHoverInside = false; };
    MouseClass.prototype.onDocumentLeave = function () { this.isHoverInside = false; };
    MouseClass.prototype.update = function () {
      if (this.takeoverActive) {
        var t = (performance.now() - this.takeoverStartTime) / (this.takeoverDuration * 1000);
        if (t >= 1) {
          this.takeoverActive = false;
          this.coords.copy(this.takeoverTo);
          this.coords_old.copy(this.coords);
          this.diff.set(0, 0);
        } else {
          var k = t * t * (3 - 2 * t);
          this.coords.copy(this.takeoverFrom).lerp(this.takeoverTo, k);
        }
      }
      this.diff.subVectors(this.coords, this.coords_old);
      this.coords_old.copy(this.coords);
      if (this.coords_old.x === 0 && this.coords_old.y === 0) this.diff.set(0, 0);
      if (this.isAutoActive && !this.takeoverActive) this.diff.multiplyScalar(this.autoIntensity);
    };
    var Mouse = new MouseClass();

    /* ---------------- AutoDriver ---------------- */
    function AutoDriver(mouse, manager, opt) {
      this.mouse = mouse; this.manager = manager;
      this.enabled = opt.enabled; this.speed = opt.speed;
      this.resumeDelay = opt.resumeDelay || 3000;
      this.rampDurationMs = (opt.rampDuration || 0) * 1000;
      this.active = false;
      this.current = new THREE.Vector2(0, 0);
      this.target = new THREE.Vector2();
      this.lastTime = performance.now();
      this.activationTime = 0;
      this.margin = 0.2;
      this._tmpDir = new THREE.Vector2();
      this.pickNewTarget();
    }
    AutoDriver.prototype.pickNewTarget = function () {
      var r = Math.random;
      this.target.set((r() * 2 - 1) * (1 - this.margin), (r() * 2 - 1) * (1 - this.margin));
    };
    AutoDriver.prototype.forceStop = function () { this.active = false; this.mouse.isAutoActive = false; };
    AutoDriver.prototype.update = function () {
      if (!this.enabled) return;
      var now = performance.now();
      if (now - this.manager.lastUserInteraction < this.resumeDelay) { if (this.active) this.forceStop(); return; }
      if (this.mouse.isHoverInside) { if (this.active) this.forceStop(); return; }
      if (!this.active) {
        this.active = true; this.current.copy(this.mouse.coords);
        this.lastTime = now; this.activationTime = now;
      }
      this.mouse.isAutoActive = true;
      var dtSec = (now - this.lastTime) / 1000;
      this.lastTime = now;
      if (dtSec > 0.2) dtSec = 0.016;
      var dir = this._tmpDir.subVectors(this.target, this.current);
      var dist = dir.length();
      if (dist < 0.01) { this.pickNewTarget(); return; }
      dir.normalize();
      var ramp = 1;
      if (this.rampDurationMs > 0) {
        var t = Math.min(1, (now - this.activationTime) / this.rampDurationMs);
        ramp = t * t * (3 - 2 * t);
      }
      var move = Math.min(this.speed * dtSec * ramp, dist);
      this.current.addScaledVector(dir, move);
      this.mouse.setNormalized(this.current.x, this.current.y);
    };

    /* ---------------- shaders (verbatim) ---------------- */
    var face_vert = `
  attribute vec3 position;
  uniform vec2 px;
  uniform vec2 boundarySpace;
  varying vec2 uv;
  precision highp float;
  void main(){
  vec3 pos = position;
  vec2 scale = 1.0 - boundarySpace * 2.0;
  pos.xy = pos.xy * scale;
  uv = vec2(0.5)+(pos.xy)*0.5;
  gl_Position = vec4(pos, 1.0);
}
`;
    var line_vert = `
  attribute vec3 position;
  uniform vec2 px;
  precision highp float;
  varying vec2 uv;
  void main(){
  vec3 pos = position;
  uv = 0.5 + pos.xy * 0.5;
  vec2 n = sign(pos.xy);
  pos.xy = abs(pos.xy) - px * 1.0;
  pos.xy *= n;
  gl_Position = vec4(pos, 1.0);
}
`;
    var mouse_vert = `
    precision highp float;
    attribute vec3 position;
    attribute vec2 uv;
    uniform vec2 center;
    uniform vec2 scale;
    uniform vec2 px;
    varying vec2 vUv;
    void main(){
    vec2 pos = position.xy * scale * 2.0 * px + center;
    vUv = uv;
    gl_Position = vec4(pos, 0.0, 1.0);
}
`;
    var advection_frag = `
    precision highp float;
    uniform sampler2D velocity;
    uniform float dt;
    uniform bool isBFECC;
    uniform vec2 fboSize;
    uniform vec2 px;
    varying vec2 uv;
    void main(){
    vec2 ratio = max(fboSize.x, fboSize.y) / fboSize;
    if(isBFECC == false){
        vec2 vel = texture2D(velocity, uv).xy;
        vec2 uv2 = uv - vel * dt * ratio;
        vec2 newVel = texture2D(velocity, uv2).xy;
        gl_FragColor = vec4(newVel, 0.0, 0.0);
    } else {
        vec2 spot_new = uv;
        vec2 vel_old = texture2D(velocity, uv).xy;
        vec2 spot_old = spot_new - vel_old * dt * ratio;
        vec2 vel_new1 = texture2D(velocity, spot_old).xy;
        vec2 spot_new2 = spot_old + vel_new1 * dt * ratio;
        vec2 error = spot_new2 - spot_new;
        vec2 spot_new3 = spot_new - error / 2.0;
        vec2 vel_2 = texture2D(velocity, spot_new3).xy;
        vec2 spot_old2 = spot_new3 - vel_2 * dt * ratio;
        vec2 newVel2 = texture2D(velocity, spot_old2).xy;
        gl_FragColor = vec4(newVel2, 0.0, 0.0);
    }
}
`;
    var color_frag = `
    precision highp float;
    uniform sampler2D velocity;
    uniform sampler2D palette;
    uniform vec4 bgColor;
    varying vec2 uv;
    void main(){
    vec2 vel = texture2D(velocity, uv).xy;
    float lenv = clamp(length(vel), 0.0, 1.0);
    vec3 c = texture2D(palette, vec2(lenv, 0.5)).rgb;
    vec3 outRGB = mix(bgColor.rgb, c, lenv);
    float outA = mix(bgColor.a, 1.0, lenv);
    gl_FragColor = vec4(outRGB, outA);
}
`;
    var divergence_frag = `
    precision highp float;
    uniform sampler2D velocity;
    uniform float dt;
    uniform vec2 px;
    varying vec2 uv;
    void main(){
    float x0 = texture2D(velocity, uv-vec2(px.x, 0.0)).x;
    float x1 = texture2D(velocity, uv+vec2(px.x, 0.0)).x;
    float y0 = texture2D(velocity, uv-vec2(0.0, px.y)).y;
    float y1 = texture2D(velocity, uv+vec2(0.0, px.y)).y;
    float divergence = (x1 - x0 + y1 - y0) / 2.0;
    gl_FragColor = vec4(divergence / dt);
}
`;
    var externalForce_frag = `
    precision highp float;
    uniform vec2 force;
    uniform vec2 center;
    uniform vec2 scale;
    uniform vec2 px;
    varying vec2 vUv;
    void main(){
    vec2 circle = (vUv - 0.5) * 2.0;
    float d = 1.0 - min(length(circle), 1.0);
    d *= d;
    gl_FragColor = vec4(force * d, 0.0, 1.0);
}
`;
    var poisson_frag = `
    precision highp float;
    uniform sampler2D pressure;
    uniform sampler2D divergence;
    uniform vec2 px;
    varying vec2 uv;
    void main(){
    float p0 = texture2D(pressure, uv + vec2(px.x * 2.0, 0.0)).r;
    float p1 = texture2D(pressure, uv - vec2(px.x * 2.0, 0.0)).r;
    float p2 = texture2D(pressure, uv + vec2(0.0, px.y * 2.0)).r;
    float p3 = texture2D(pressure, uv - vec2(0.0, px.y * 2.0)).r;
    float div = texture2D(divergence, uv).r;
    float newP = (p0 + p1 + p2 + p3) / 4.0 - div;
    gl_FragColor = vec4(newP);
}
`;
    var pressure_frag = `
    precision highp float;
    uniform sampler2D pressure;
    uniform sampler2D velocity;
    uniform vec2 px;
    uniform float dt;
    varying vec2 uv;
    void main(){
    float step = 1.0;
    float p0 = texture2D(pressure, uv + vec2(px.x * step, 0.0)).r;
    float p1 = texture2D(pressure, uv - vec2(px.x * step, 0.0)).r;
    float p2 = texture2D(pressure, uv + vec2(0.0, px.y * step)).r;
    float p3 = texture2D(pressure, uv - vec2(0.0, px.y * step)).r;
    vec2 v = texture2D(velocity, uv).xy;
    vec2 gradP = vec2(p0 - p1, p2 - p3) * 0.5;
    v = v - gradP * dt;
    gl_FragColor = vec4(v, 0.0, 1.0);
}
`;
    var viscous_frag = `
    precision highp float;
    uniform sampler2D velocity;
    uniform sampler2D velocity_new;
    uniform float v;
    uniform vec2 px;
    uniform float dt;
    varying vec2 uv;
    void main(){
    vec2 old = texture2D(velocity, uv).xy;
    vec2 new0 = texture2D(velocity_new, uv + vec2(px.x * 2.0, 0.0)).xy;
    vec2 new1 = texture2D(velocity_new, uv - vec2(px.x * 2.0, 0.0)).xy;
    vec2 new2 = texture2D(velocity_new, uv + vec2(0.0, px.y * 2.0)).xy;
    vec2 new3 = texture2D(velocity_new, uv - vec2(0.0, px.y * 2.0)).xy;
    vec2 newv = 4.0 * old + v * dt * (new0 + new1 + new2 + new3);
    newv /= 4.0 * (1.0 + v * dt);
    gl_FragColor = vec4(newv, 0.0, 0.0);
}
`;

    /* ---------------- passes ---------------- */
    function ShaderPass(props) {
      this.props = props || {};
      this.uniforms = this.props.material ? this.props.material.uniforms : null;
      this.scene = null; this.camera = null; this.material = null;
      this.geometry = null; this.plane = null;
    }
    ShaderPass.prototype.init = function () {
      this.scene = new THREE.Scene();
      this.camera = new THREE.Camera();
      if (this.uniforms) {
        this.material = new THREE.RawShaderMaterial(this.props.material);
        this.geometry = new THREE.PlaneGeometry(2.0, 2.0);
        this.plane = new THREE.Mesh(this.geometry, this.material);
        this.scene.add(this.plane);
      }
    };
    ShaderPass.prototype.update = function () {
      Common.renderer.setRenderTarget(this.props.output || null);
      Common.renderer.render(this.scene, this.camera);
      Common.renderer.setRenderTarget(null);
    };

    function extend(Child, Parent) {
      Child.prototype = Object.create(Parent.prototype);
      Child.prototype.constructor = Child;
    }

    function Advection(sp) {
      ShaderPass.call(this, {
        material: {
          vertexShader: face_vert, fragmentShader: advection_frag,
          uniforms: {
            boundarySpace: { value: sp.cellScale },
            px: { value: sp.cellScale },
            fboSize: { value: sp.fboSize },
            velocity: { value: sp.src.texture },
            dt: { value: sp.dt },
            isBFECC: { value: true }
          }
        },
        output: sp.dst
      });
      this.uniforms = this.props.material.uniforms;
      this.init();
    }
    extend(Advection, ShaderPass);
    Advection.prototype.init = function () {
      ShaderPass.prototype.init.call(this);
      var boundaryG = new THREE.BufferGeometry();
      var v = new Float32Array([-1,-1,0, -1,1,0, -1,1,0, 1,1,0, 1,1,0, 1,-1,0, 1,-1,0, -1,-1,0]);
      boundaryG.setAttribute('position', new THREE.BufferAttribute(v, 3));
      var boundaryM = new THREE.RawShaderMaterial({
        vertexShader: line_vert, fragmentShader: advection_frag, uniforms: this.uniforms
      });
      this.line = new THREE.LineSegments(boundaryG, boundaryM);
      this.scene.add(this.line);
    };
    Advection.prototype.update = function (p) {
      this.uniforms.dt.value = p.dt;
      this.line.visible = p.isBounce;
      this.uniforms.isBFECC.value = p.BFECC;
      ShaderPass.prototype.update.call(this);
    };

    function ExternalForce(sp) {
      ShaderPass.call(this, { output: sp.dst });
      this.init(sp);
    }
    extend(ExternalForce, ShaderPass);
    ExternalForce.prototype.init = function (sp) {
      ShaderPass.prototype.init.call(this);
      var mouseG = new THREE.PlaneGeometry(1, 1);
      var mouseM = new THREE.RawShaderMaterial({
        vertexShader: mouse_vert, fragmentShader: externalForce_frag,
        blending: THREE.AdditiveBlending, depthWrite: false,
        uniforms: {
          px: { value: sp.cellScale },
          force: { value: new THREE.Vector2(0, 0) },
          center: { value: new THREE.Vector2(0, 0) },
          scale: { value: new THREE.Vector2(sp.cursor_size, sp.cursor_size) }
        }
      });
      this.mouse = new THREE.Mesh(mouseG, mouseM);
      this.scene.add(this.mouse);
    };
    ExternalForce.prototype.update = function (p) {
      var forceX = (Mouse.diff.x / 2) * p.mouse_force;
      var forceY = (Mouse.diff.y / 2) * p.mouse_force;
      var cx = p.cursor_size * p.cellScale.x, cy = p.cursor_size * p.cellScale.y;
      var centerX = Math.min(Math.max(Mouse.coords.x, -1 + cx + p.cellScale.x * 2), 1 - cx - p.cellScale.x * 2);
      var centerY = Math.min(Math.max(Mouse.coords.y, -1 + cy + p.cellScale.y * 2), 1 - cy - p.cellScale.y * 2);
      var u = this.mouse.material.uniforms;
      u.force.value.set(forceX, forceY);
      u.center.value.set(centerX, centerY);
      u.scale.value.set(p.cursor_size, p.cursor_size);
      ShaderPass.prototype.update.call(this);
    };

    function Viscous(sp) {
      ShaderPass.call(this, {
        material: {
          vertexShader: face_vert, fragmentShader: viscous_frag,
          uniforms: {
            boundarySpace: { value: sp.boundarySpace },
            velocity: { value: sp.src.texture },
            velocity_new: { value: sp.dst_.texture },
            v: { value: sp.viscous },
            px: { value: sp.cellScale },
            dt: { value: sp.dt }
          }
        },
        output: sp.dst, output0: sp.dst_, output1: sp.dst
      });
      this.uniforms = this.props.material.uniforms;
      this.init();
    }
    extend(Viscous, ShaderPass);
    Viscous.prototype.update = function (p) {
      var fbo_in, fbo_out;
      this.uniforms.v.value = p.viscous;
      for (var i = 0; i < p.iterations; i++) {
        if (i % 2 === 0) { fbo_in = this.props.output0; fbo_out = this.props.output1; }
        else { fbo_in = this.props.output1; fbo_out = this.props.output0; }
        this.uniforms.velocity_new.value = fbo_in.texture;
        this.props.output = fbo_out;
        this.uniforms.dt.value = p.dt;
        ShaderPass.prototype.update.call(this);
      }
      return fbo_out;
    };

    function Divergence(sp) {
      ShaderPass.call(this, {
        material: {
          vertexShader: face_vert, fragmentShader: divergence_frag,
          uniforms: {
            boundarySpace: { value: sp.boundarySpace },
            velocity: { value: sp.src.texture },
            px: { value: sp.cellScale },
            dt: { value: sp.dt }
          }
        },
        output: sp.dst
      });
      this.uniforms = this.props.material.uniforms;
      this.init();
    }
    extend(Divergence, ShaderPass);
    Divergence.prototype.update = function (p) {
      this.uniforms.velocity.value = p.vel.texture;
      ShaderPass.prototype.update.call(this);
    };

    function Poisson(sp) {
      ShaderPass.call(this, {
        material: {
          vertexShader: face_vert, fragmentShader: poisson_frag,
          uniforms: {
            boundarySpace: { value: sp.boundarySpace },
            pressure: { value: sp.dst_.texture },
            divergence: { value: sp.src.texture },
            px: { value: sp.cellScale }
          }
        },
        output: sp.dst, output0: sp.dst_, output1: sp.dst
      });
      this.uniforms = this.props.material.uniforms;
      this.init();
    }
    extend(Poisson, ShaderPass);
    Poisson.prototype.update = function (p) {
      var p_in, p_out;
      for (var i = 0; i < p.iterations; i++) {
        if (i % 2 === 0) { p_in = this.props.output0; p_out = this.props.output1; }
        else { p_in = this.props.output1; p_out = this.props.output0; }
        this.uniforms.pressure.value = p_in.texture;
        this.props.output = p_out;
        ShaderPass.prototype.update.call(this);
      }
      return p_out;
    };

    function Pressure(sp) {
      ShaderPass.call(this, {
        material: {
          vertexShader: face_vert, fragmentShader: pressure_frag,
          uniforms: {
            boundarySpace: { value: sp.boundarySpace },
            pressure: { value: sp.src_p.texture },
            velocity: { value: sp.src_v.texture },
            px: { value: sp.cellScale },
            dt: { value: sp.dt }
          }
        },
        output: sp.dst
      });
      this.uniforms = this.props.material.uniforms;
      this.init();
    }
    extend(Pressure, ShaderPass);
    Pressure.prototype.update = function (p) {
      this.uniforms.velocity.value = p.vel.texture;
      this.uniforms.pressure.value = p.pressure.texture;
      ShaderPass.prototype.update.call(this);
    };

    /* ---------------- simulation ---------------- */
    function Simulation() {
      this.options = {
        iterations_poisson: o.iterationsPoisson,
        iterations_viscous: o.iterationsViscous,
        mouse_force: o.mouseForce,
        resolution: o.resolution,
        cursor_size: o.cursorSize,
        viscous: o.viscous,
        isBounce: o.isBounce,
        dt: o.dt,
        isViscous: o.isViscous,
        BFECC: o.BFECC
      };
      this.fbos = { vel_0:null, vel_1:null, vel_viscous0:null, vel_viscous1:null, div:null, pressure_0:null, pressure_1:null };
      this.fboSize = new THREE.Vector2();
      this.cellScale = new THREE.Vector2();
      this.boundarySpace = new THREE.Vector2();
      this.init();
    }
    Simulation.prototype.getFloatType = function () {
      var isIOS = /(iPad|iPhone|iPod)/i.test(navigator.userAgent);
      return isIOS ? THREE.HalfFloatType : THREE.FloatType;
    };
    Simulation.prototype.init = function () {
      this.calcSize(); this.createAllFBO(); this.createShaderPass();
    };
    Simulation.prototype.createAllFBO = function () {
      var type = this.getFloatType();
      var opts = {
        type: type, depthBuffer: false, stencilBuffer: false,
        minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter,
        wrapS: THREE.ClampToEdgeWrapping, wrapT: THREE.ClampToEdgeWrapping
      };
      for (var key in this.fbos) {
        this.fbos[key] = new THREE.WebGLRenderTarget(this.fboSize.x, this.fboSize.y, opts);
      }
    };
    Simulation.prototype.createShaderPass = function () {
      this.advection = new Advection({ cellScale:this.cellScale, fboSize:this.fboSize, dt:this.options.dt, src:this.fbos.vel_0, dst:this.fbos.vel_1 });
      this.externalForce = new ExternalForce({ cellScale:this.cellScale, cursor_size:this.options.cursor_size, dst:this.fbos.vel_1 });
      this.viscous = new Viscous({ cellScale:this.cellScale, boundarySpace:this.boundarySpace, viscous:this.options.viscous, src:this.fbos.vel_1, dst:this.fbos.vel_viscous1, dst_:this.fbos.vel_viscous0, dt:this.options.dt });
      this.divergence = new Divergence({ cellScale:this.cellScale, boundarySpace:this.boundarySpace, src:this.fbos.vel_viscous0, dst:this.fbos.div, dt:this.options.dt });
      this.poisson = new Poisson({ cellScale:this.cellScale, boundarySpace:this.boundarySpace, src:this.fbos.div, dst:this.fbos.pressure_1, dst_:this.fbos.pressure_0 });
      this.pressure = new Pressure({ cellScale:this.cellScale, boundarySpace:this.boundarySpace, src_p:this.fbos.pressure_0, src_v:this.fbos.vel_viscous0, dst:this.fbos.vel_0, dt:this.options.dt });
    };
    Simulation.prototype.calcSize = function () {
      var width = Math.max(1, Math.round(this.options.resolution * Common.width));
      var height = Math.max(1, Math.round(this.options.resolution * Common.height));
      this.cellScale.set(1.0 / width, 1.0 / height);
      this.fboSize.set(width, height);
    };
    Simulation.prototype.resize = function () {
      this.calcSize();
      for (var key in this.fbos) this.fbos[key].setSize(this.fboSize.x, this.fboSize.y);
    };
    Simulation.prototype.update = function () {
      if (this.options.isBounce) this.boundarySpace.set(0, 0);
      else this.boundarySpace.copy(this.cellScale);
      this.advection.update({ dt:this.options.dt, isBounce:this.options.isBounce, BFECC:this.options.BFECC });
      this.externalForce.update({ cursor_size:this.options.cursor_size, mouse_force:this.options.mouse_force, cellScale:this.cellScale });
      var vel = this.fbos.vel_1;
      if (this.options.isViscous) {
        vel = this.viscous.update({ viscous:this.options.viscous, iterations:this.options.iterations_viscous, dt:this.options.dt });
      }
      this.divergence.update({ vel: vel });
      var pressure = this.poisson.update({ iterations: this.options.iterations_poisson });
      this.pressure.update({ vel: vel, pressure: pressure });
    };

    function Output() {
      this.simulation = new Simulation();
      this.scene = new THREE.Scene();
      this.camera = new THREE.Camera();
      this.output = new THREE.Mesh(
        new THREE.PlaneGeometry(2, 2),
        new THREE.RawShaderMaterial({
          vertexShader: face_vert, fragmentShader: color_frag,
          transparent: true, depthWrite: false,
          uniforms: {
            velocity: { value: this.simulation.fbos.vel_0.texture },
            boundarySpace: { value: new THREE.Vector2() },
            palette: { value: paletteTex },
            bgColor: { value: bgVec4 }
          }
        })
      );
      this.scene.add(this.output);
    }
    Output.prototype.resize = function () { this.simulation.resize(); };
    Output.prototype.render = function () {
      Common.renderer.setRenderTarget(null);
      Common.renderer.render(this.scene, this.camera);
    };
    Output.prototype.update = function () { this.simulation.update(); this.render(); };

    /* ---------------- manager ---------------- */
    function WebGLManager(props) {
      this.props = props;
      Common.init(props.$wrapper);
      Mouse.init(props.$wrapper);
      Mouse.autoIntensity = props.autoIntensity;
      Mouse.takeoverDuration = props.takeoverDuration;
      this.lastUserInteraction = performance.now();
      var self = this;
      Mouse.onInteract = function () {
        self.lastUserInteraction = performance.now();
        if (self.autoDriver) self.autoDriver.forceStop();
      };
      this.autoDriver = new AutoDriver(Mouse, this, {
        enabled: props.autoDemo, speed: props.autoSpeed,
        resumeDelay: props.autoResumeDelay, rampDuration: props.autoRampDuration
      });
      props.$wrapper.prepend(Common.renderer.domElement);
      this.output = new Output();
      this._loop = this.loop.bind(this);
      this._resize = this.resize.bind(this);
      global.addEventListener('resize', this._resize);
      this._onVisibility = function () {
        if (document.hidden) self.pause();
        else if (isVisible) self.start();
      };
      document.addEventListener('visibilitychange', this._onVisibility);
      this.running = false;
    }
    WebGLManager.prototype.resize = function () { Common.resize(); this.output.resize(); };
    WebGLManager.prototype.render = function () {
      if (this.autoDriver) this.autoDriver.update();
      Mouse.update(); Common.update(); this.output.update();
    };
    WebGLManager.prototype.loop = function () {
      if (!this.running) return;
      this.render();
      rafId = requestAnimationFrame(this._loop);
    };
    WebGLManager.prototype.start = function () {
      if (this.running) return;
      this.running = true; this._loop();
    };
    WebGLManager.prototype.pause = function () {
      this.running = false;
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    };
    WebGLManager.prototype.dispose = function () {
      try {
        global.removeEventListener('resize', this._resize);
        document.removeEventListener('visibilitychange', this._onVisibility);
        Mouse.dispose();
        if (Common.renderer) {
          var c = Common.renderer.domElement;
          if (c && c.parentNode) c.parentNode.removeChild(c);
          Common.renderer.dispose();
          Common.renderer.forceContextLoss();
        }
      } catch (e) { /* noop */ }
    };

    container.style.position = container.style.position || 'relative';
    container.style.overflow = container.style.overflow || 'hidden';

    var webgl;
    try {
      webgl = new WebGLManager({
        $wrapper: container,
        autoDemo: o.autoDemo, autoSpeed: o.autoSpeed, autoIntensity: o.autoIntensity,
        takeoverDuration: o.takeoverDuration, autoResumeDelay: o.autoResumeDelay,
        autoRampDuration: o.autoRampDuration
      });
    } catch (e) {
      console.warn('LiquidEther: WebGL init failed', e);
      return null;
    }
    webgl.start();

    var io = new IntersectionObserver(function (entries) {
      var e = entries[0];
      isVisible = e.isIntersecting && e.intersectionRatio > 0;
      if (isVisible && !document.hidden) webgl.start(); else webgl.pause();
    }, { threshold: [0, 0.01, 0.1] });
    io.observe(container);

    var ro = new ResizeObserver(function () {
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(function () { webgl.resize(); });
    });
    ro.observe(container);

    return {
      destroy: function () {
        if (rafId) cancelAnimationFrame(rafId);
        try { ro.disconnect(); } catch (e) {}
        try { io.disconnect(); } catch (e) {}
        webgl.dispose();
      }
    };
  }

  global.LiquidEther = { mount: mount };
})(window);
