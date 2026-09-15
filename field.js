/* field.js — flow-field streamlines drawn behind the hero (and page intros).
   Particles follow a slowly drifting simplex-noise vector field and leave thin ink trails,
   so the canvas reads like a streamline plot. The cursor bends the field with a small vortex;
   a click "diffuses" the lines into noise, after which they settle back into streamlines.
   No dependencies. Respects prefers-reduced-motion (renders one static frame). */
(() => {
  const canvases = document.querySelectorAll('canvas[data-field]');
  if (!canvases.length) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const root = document.documentElement;

  // 2D simplex noise (Gustavson's reference algorithm) with a seeded permutation table.
  function makeNoise(seed) {
    let s = seed >>> 0;
    const rand = () => {
      s = (s + 0x6D2B79F5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const p = Array.from({ length: 256 }, (_, i) => i);
    for (let i = 255; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; }
    const perm = new Uint8Array(512);
    for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
    const G = [[1, 1], [-1, 1], [1, -1], [-1, -1], [1, 0], [-1, 0], [0, 1], [0, -1]];
    const F2 = 0.5 * (Math.sqrt(3) - 1), G2 = (3 - Math.sqrt(3)) / 6;
    return (x, y) => {
      const sk = (x + y) * F2, i = Math.floor(x + sk), j = Math.floor(y + sk);
      const t = (i + j) * G2, x0 = x - (i - t), y0 = y - (j - t);
      const i1 = x0 > y0 ? 1 : 0, j1 = 1 - i1;
      const x1 = x0 - i1 + G2, y1 = y0 - j1 + G2, x2 = x0 - 1 + 2 * G2, y2 = y0 - 1 + 2 * G2;
      const ii = i & 255, jj = j & 255;
      let n = 0, t0 = 0.5 - x0 * x0 - y0 * y0, t1 = 0.5 - x1 * x1 - y1 * y1, t2 = 0.5 - x2 * x2 - y2 * y2;
      if (t0 > 0) { const g = G[perm[ii + perm[jj]] & 7]; t0 *= t0; n += t0 * t0 * (g[0] * x0 + g[1] * y0); }
      if (t1 > 0) { const g = G[perm[ii + i1 + perm[jj + j1]] & 7]; t1 *= t1; n += t1 * t1 * (g[0] * x1 + g[1] * y1); }
      if (t2 > 0) { const g = G[perm[ii + 1 + perm[jj + 1]] & 7]; t2 *= t2; n += t2 * t2 * (g[0] * x2 + g[1] * y2); }
      return 70 * n;
    };
  }

  const inkColor = (alpha) => {
    const rgb = getComputedStyle(root).getPropertyValue('--field-rgb').trim() || '17 19 24';
    return `rgb(${rgb} / ${alpha})`;
  };

  class Field {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.host = canvas.parentElement;
      this.noise = makeNoise(20260915);
      this.particles = [];
      this.mouse = { x: 0, y: 0, active: false };
      this.heat = 0;     // > 0 right after a click: particles jitter, then cool down
      this.t = 0;
      this.running = false;
      this.inView = true;
      this.color = inkColor(0.22);
      this.resize();
      this.bind();
      if (reduced.matches) this.renderStatic(); else this.start();
    }

    resize() {
      const rect = this.canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.w = rect.width; this.h = rect.height;
      this.canvas.width = Math.round(rect.width * dpr);
      this.canvas.height = Math.round(rect.height * dpr);
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(360, Math.max(90, (rect.width * rect.height) / 3600)));
      this.particles = Array.from({ length: count }, () => this.spawn({}));
      this.ctx.clearRect(0, 0, this.w, this.h);
    }

    spawn(p) {
      p.x = Math.random() * this.w; p.y = Math.random() * this.h;
      p.px = p.x; p.py = p.y;
      p.life = 120 + Math.random() * 360;
      return p;
    }

    step(dt, fade = true) {
      const { ctx, w, h, mouse: m } = this;
      const k = Math.min(dt, 48) / 16.7;   // normalise to a 60 Hz frame
      this.t += 0.00012 * dt;
      this.heat *= Math.pow(0.96, k);

      // Fade existing trails toward transparent, keeping the canvas see-through.
      if (fade) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = 'rgba(0,0,0,0.032)';
        ctx.fillRect(0, 0, w, h);
        ctx.globalCompositeOperation = 'source-over';
      }

      ctx.strokeStyle = this.color;
      ctx.lineWidth = 1;
      ctx.lineCap = 'round';
      ctx.beginPath();
      const scale = 0.0017, speed = 1.1 * k, R = 150, heat = this.heat;
      for (const p of this.particles) {
        const a = this.noise(p.x * scale + this.t, p.y * scale - this.t * 0.7) * Math.PI * 1.7;
        let vx = Math.cos(a) * speed, vy = Math.sin(a) * speed;
        if (m.active) {
          const dx = p.x - m.x, dy = p.y - m.y, d = Math.hypot(dx, dy);
          if (d < R && d > 0.001) {
            const f = 1 - d / R, push = f * f * 2.4 * k, swirl = f * 2.6 * k;
            vx += (dx / d) * push - (dy / d) * swirl;
            vy += (dy / d) * push + (dx / d) * swirl;
          }
        }
        if (heat > 0.01) { vx += (Math.random() - 0.5) * heat * 10 * k; vy += (Math.random() - 0.5) * heat * 10 * k; }
        p.px = p.x; p.py = p.y;
        p.x += vx; p.y += vy;
        p.life -= k;
        if (p.life <= 0 || p.x < -8 || p.x > w + 8 || p.y < -8 || p.y > h + 8) { this.spawn(p); continue; }
        ctx.moveTo(p.px, p.py);
        ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    }

    // Reduced motion: integrate a few steps once and leave the streamlines on screen.
    renderStatic() {
      this.ctx.clearRect(0, 0, this.w, this.h);
      const prev = this.color;
      this.color = inkColor(0.1);
      this.ctx.globalCompositeOperation = 'source-over';
      for (let i = 0; i < 70; i++) this.step(16.7, false);
      this.color = prev;
    }

    loop = (now) => {
      if (!this.running) return;
      const dt = this.last ? now - this.last : 16.7;
      this.last = now;
      this.step(dt);
      requestAnimationFrame(this.loop);
    };

    start() {
      if (this.running || reduced.matches || !this.inView || document.hidden) return;
      this.running = true; this.last = 0;
      this.host.classList.add('is-live');
      requestAnimationFrame(this.loop);
    }
    stop() { this.running = false; }

    bind() {
      const host = this.host;
      host.addEventListener('pointermove', (e) => {
        const r = this.canvas.getBoundingClientRect();
        this.mouse.x = e.clientX - r.left; this.mouse.y = e.clientY - r.top; this.mouse.active = true;
      });
      host.addEventListener('pointerleave', () => { this.mouse.active = false; });
      host.addEventListener('pointerdown', (e) => {
        if (e.target.closest('a, button, summary, select, input, textarea')) return;
        this.heat = 1;
        if (reduced.matches) this.renderStatic();
      });

      let raf = 0;
      new ResizeObserver(() => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => { this.resize(); if (reduced.matches) this.renderStatic(); });
      }).observe(this.canvas);

      new IntersectionObserver(([entry]) => {
        this.inView = entry.isIntersecting;
        if (this.inView) this.start(); else this.stop();
      }, { rootMargin: '80px' }).observe(host);

      document.addEventListener('visibilitychange', () => { if (document.hidden) this.stop(); else this.start(); });

      // Old trails are the old ink colour on the new background, i.e. invisible; they fade out on their own.
      const recolor = () => {
        this.color = inkColor(0.22);
        if (reduced.matches) this.renderStatic();
      };
      new MutationObserver(recolor).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
      matchMedia('(prefers-color-scheme: dark)').addEventListener('change', recolor);
      reduced.addEventListener('change', () => { if (reduced.matches) { this.stop(); this.renderStatic(); } else this.start(); });
    }
  }

  canvases.forEach((c) => new Field(c));
})();
