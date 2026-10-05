/*
  CYMOR CORE — dependency-free pseudo-3D engine on a 2D canvas.
  A node-and-link sphere with orbiting technology "satellites".
  Used by the intro (intro.js) and the hero (hero.js).
  No WebGL needed, so it runs on low-end phones and doubles as the fallback.
*/
(function(){
  const TAU = Math.PI * 2;
  const DEFAULT_STACK = [
    {name:'JavaScript',caption:'WEB • APPS • BOTS'},{name:'Node.js',caption:'BACKEND • APIs'},
    {name:'Express',caption:'SERVERS • REST'},{name:'MongoDB',caption:'DATA • ATLAS'},
    {name:'Python',caption:'TOOLS • SCRIPTING'},{name:'HTML',caption:'STRUCTURE'},{name:'CSS',caption:'INTERFACES'}
  ];
  // Shared, single fetch of data/stack.json (falls back to defaults if it fails)
  window.CYMOR_STACK_P = fetch('data/stack.json')
    .then(r => r.ok ? r.json() : DEFAULT_STACK).catch(() => DEFAULT_STACK);

  const ease = t => t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2;

  class CymorCore{
    constructor(canvas, opts){
      this.cv = canvas;
      this.ctx = canvas.getContext('2d');
      this.o = Object.assign({nodes:140, link:.46, labels:[], dprMax:2, rings:true, grow:1, sat:1, radius:.27}, opts);
      this.grow = this.o.grow; this.sat = this.o.sat;
      this.ox = 0; this.oy = 0; this.scale = 1; this.pulse = 0;
      this.yaw = 0; this.pitch = .28; this.px = 0; this.py = 0; this.tpx = 0; this.tpy = 0;
      this.mx = -1e4; this.my = -1e4; this.hover = -1; this.onHover = null; this.beat = false;
      this.hits = []; this.lit = 0; this.litAt = 0;
      this.raf = 0; this.last = 0; this.t = 0; this.running = false;
      this.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      this._build();
      this._loop = this._loop.bind(this);
      this._ro = new ResizeObserver(() => this.resize());
      this._ro.observe(canvas);
      this.resize();
    }
    _build(){
      const n = this.o.nodes, pts = [];
      const ga = Math.PI * (3 - Math.sqrt(5));
      for(let i = 0; i < n; i++){
        const y = 1 - (i / (n - 1)) * 2, r = Math.sqrt(1 - y*y), a = i * ga;
        pts.push({x:Math.cos(a)*r, y, z:Math.sin(a)*r});
      }
      this.pts = pts; this.edges = [];
      const L2 = this.o.link * this.o.link;
      for(let i = 0; i < n; i++) for(let j = i + 1; j < n; j++){
        const dx = pts[i].x-pts[j].x, dy = pts[i].y-pts[j].y, dz = pts[i].z-pts[j].z;
        if(dx*dx + dy*dy + dz*dz < L2) this.edges.push([i, j]);
      }
      const labels = this.o.labels;
      this.sats = labels.map((l, i) => ({
        name:l.name, caption:l.caption || '',
        r:1.45 + (i % 3) * .2, tilt:((i * 1.13) % Math.PI) - Math.PI/2,
        speed:(.16 + (i % 4) * .035) * (i % 2 ? -1 : 1), phase:i / labels.length * TAU
      }));
    }
    resize(){
      const dpr = Math.min(window.devicePixelRatio || 1, this.o.dprMax);
      const w = this.cv.clientWidth, h = this.cv.clientHeight;
      if(!w || !h) return;
      this.w = w; this.h = h;
      this.cv.width = Math.round(w * dpr); this.cv.height = Math.round(h * dpr);
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if(!this.running) this._draw();
    }
    setPointer(x, y){ this.mx = x; this.my = y; }
    setParallax(nx, ny){ this.tpx = nx; this.tpy = ny; }
    start(){ if(this.running) return; this.running = true; this.last = performance.now(); this.raf = requestAnimationFrame(this._loop); }
    stop(){ this.running = false; cancelAnimationFrame(this.raf); }
    dispose(){ this.stop(); this._ro.disconnect(); }
    _loop(now){
      if(!this.running) return;
      const dt = Math.min(.05, (now - this.last) / 1000); this.last = now;
      if(!this.reduced) this.t += dt;
      if(!this.reduced) this.yaw += dt * .12;
      this.px += (this.tpx - this.px) * .05; this.py += (this.tpy - this.py) * .05;
      this.pulse = this.beat ? .32 + .22 * Math.sin(this.t * 3.2) : this.pulse * .94;
      if(this.t - this.litAt > 2.2 && this.sats.length){ this.litAt = this.t; this.lit = (this.lit + 1 + Math.floor(Math.random()*2)) % this.sats.length; }
      this._draw();
      this.raf = requestAnimationFrame(this._loop);
    }
    _proj(x, y, z, ry, rx, cx, cy, R){
      const x1 = x*Math.cos(ry) + z*Math.sin(ry), z1 = -x*Math.sin(ry) + z*Math.cos(ry);
      const y2 = y*Math.cos(rx) - z1*Math.sin(rx), z2 = y*Math.sin(rx) + z1*Math.cos(rx);
      const f = 3.2 / (3.2 + z2);
      return {x:cx + x1*R*f, y:cy + y2*R*f, z:z2, f};
    }
    _draw(){
      const c = this.ctx, w = this.w, h = this.h; if(!w) return;
      c.clearRect(0, 0, w, h);
      const g = ease(Math.min(1, Math.max(0, this.grow)));
      const R = Math.min(w, h) * this.o.radius * this.scale * (.12 + .88 * g);
      const cx = w/2 + this.ox * w, cy = h/2 + this.oy * h;
      const ry = this.yaw + this.px * .6, rx = this.pitch + this.py * .35;
      // atmosphere
      const glow = c.createRadialGradient(cx, cy, 0, cx, cy, R * (1.9 + this.pulse * .4));
      glow.addColorStop(0, `rgba(139,107,255,${(.30 + this.pulse * .25) * g})`);
      glow.addColorStop(.5, `rgba(56,214,255,${.08 * g})`);
      glow.addColorStop(1, 'rgba(5,5,11,0)');
      c.fillStyle = glow; c.fillRect(0, 0, w, h);
      // the initial point of light
      const dotA = 1 - g * .7;
      c.beginPath(); c.arc(cx, cy, 2 + 3 * (1 - g), 0, TAU);
      c.fillStyle = `rgba(255,255,255,${dotA})`; c.shadowColor = '#8b6bff'; c.shadowBlur = 18; c.fill(); c.shadowBlur = 0;
      if(g <= 0) return;
      // satellites, split into behind / in front of the core
      const sp = this.sats.map((s, i) => {
        const a = s.phase + this.t * s.speed, lx = Math.cos(a) * s.r, lz = Math.sin(a) * s.r;
        const p = this._proj(lx*Math.cos(s.tilt), lx*Math.sin(s.tilt), lz, ry, rx, cx, cy, R);
        p.s = s; p.i = i; return p;
      });
      this.hits = [];
      if(this.o.rings && this.sat > 0) this._rings(c, ry, rx, cx, cy, R);
      sp.filter(p => p.z > .1).forEach(p => this._label(c, p));
      // core mesh
      const P = this.pts.map(p => this._proj(p.x, p.y, p.z, ry, rx, cx, cy, R));
      for(const [i, j] of this.edges){
        const a = P[i], b = P[j], d = (1 - (a.z + b.z) / 2) * .5;
        c.strokeStyle = `rgba(120,190,255,${(.05 + d * .30) * g})`;
        c.lineWidth = 1; c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke();
      }
      for(const p of P){
        const d = (1 - p.z) * .5, dx = p.x - this.mx, dy = p.y - this.my;
        const near = Math.max(0, 1 - Math.sqrt(dx*dx + dy*dy) / 120);
        c.fillStyle = near > .05 ? `rgba(244,195,104,${(.5 + near * .5) * g})` : `rgba(190,225,255,${(.25 + d * .7) * g})`;
        c.beginPath(); c.arc(p.x, p.y, (1 + d * 1.4 + near * 1.5) * p.f * (1 + this.pulse * .5), 0, TAU); c.fill();
      }
      // inner nucleus
      const core = c.createRadialGradient(cx, cy, 0, cx, cy, R * .38);
      core.addColorStop(0, `rgba(255,236,190,${.9 * g})`); core.addColorStop(1, 'rgba(244,195,104,0)');
      c.fillStyle = core; c.beginPath(); c.arc(cx, cy, R * .38, 0, TAU); c.fill();
      sp.filter(p => p.z <= .1).forEach(p => this._label(c, p));
      // hover detection
      let hv = -1;
      for(const h of this.hits) if(this.mx >= h.x && this.mx <= h.x + h.w && this.my >= h.y && this.my <= h.y + h.h) hv = h.i;
      if(hv !== this.hover){ this.hover = hv; if(this.onHover) this.onHover(hv, hv < 0 ? null : this.hits.find(h => h.i === hv), this.sats[hv]); }
    }
    _rings(c, ry, rx, cx, cy, R){
      c.lineWidth = 1;
      for(const s of this.sats){
        c.strokeStyle = `rgba(139,107,255,${.09 * this.sat})`; c.beginPath();
        for(let k = 0; k <= 48; k++){
          const a = k / 48 * TAU, lx = Math.cos(a) * s.r, lz = Math.sin(a) * s.r;
          const p = this._proj(lx*Math.cos(s.tilt), lx*Math.sin(s.tilt), lz, ry, rx, cx, cy, R);
          k ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y);
        }
        c.stroke();
      }
    }
    _label(c, p){
      const s = p.s, d = (1 - p.z) * .5, a = (.35 + d * .65) * this.sat;
      if(a <= .01) return;
      const size = Math.max(9, Math.round(11.5 * p.f)), hovered = this.hover === p.i, lit = this.lit === p.i;
      c.font = `500 ${size}px 'IBM Plex Mono', monospace`;
      const tw = c.measureText(s.name).width, w = tw + 22, h = size + 12, x = p.x - w/2, y = p.y - h/2;
      c.globalAlpha = a;
      c.shadowColor = hovered || lit ? '#f4c368' : 'transparent'; c.shadowBlur = hovered ? 22 : lit ? 14 : 0;
      c.fillStyle = 'rgba(10,9,20,.78)'; c.strokeStyle = hovered || lit ? 'rgba(244,195,104,.95)' : 'rgba(120,190,255,.45)';
      c.lineWidth = 1; c.beginPath();
      c.roundRect ? c.roundRect(x, y, w, h, h/2) : c.rect(x, y, w, h);
      c.fill(); c.stroke(); c.shadowBlur = 0;
      c.fillStyle = hovered || lit ? '#fff3d6' : '#cfe6ff'; c.textBaseline = 'middle'; c.textAlign = 'center';
      c.fillText(s.name, p.x, p.y + 1); c.globalAlpha = 1;
      if(this.sat > .5) this.hits.push({i:p.i, x, y, w, h});
    }
  }
  window.CymorCore = CymorCore;
})();
