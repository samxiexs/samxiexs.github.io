/* site.js — small interactions for the home page:
   scroll-spy for the sidebar nav, the portrait tilt, the Atlanta clock,
   and the procedurally drawn project covers. No dependencies. */
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canHover = matchMedia('(hover: hover)').matches;

  /* ---------- scroll-spy: highlight the section under the reading line ---------- */
  const spy = document.querySelector('[data-spy]');
  if (spy) {
    const links = [...spy.querySelectorAll('a[href^="#"]')];
    const targets = links.map((a) => document.getElementById(a.hash.slice(1))).filter(Boolean);
    let ticking = false;
    const update = () => {
      ticking = false;
      const line = window.scrollY + window.innerHeight * 0.35;
      const atEnd = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      let current = targets[0];
      for (const t of targets) if (t.offsetTop <= line) current = t;
      if (atEnd) current = targets[targets.length - 1];
      links.forEach((a) => {
        const active = current && a.hash === `#${current.id}`;
        a.classList.toggle('is-active', active);
        if (active) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
      });
    };
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ---------- portrait tilt ---------- */
  document.querySelectorAll('[data-tilt]').forEach((el) => {
    if (!canHover || reduced) return;
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5, ny = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty('--ry', `${(nx * 10).toFixed(2)}deg`);
      el.style.setProperty('--rx', `${(-ny * 10).toFixed(2)}deg`);
    });
    el.addEventListener('pointerleave', () => { el.style.setProperty('--ry', '0deg'); el.style.setProperty('--rx', '0deg'); });
  });

  /* ---------- local time in Atlanta ---------- */
  const clock = document.querySelector('[data-clock]');
  if (clock && typeof Intl !== 'undefined') {
    const fmt = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit', hour12: false });
    const time = clock.querySelector('time');
    const tick = () => { const now = new Date(); time.textContent = fmt.format(now); time.dateTime = now.toISOString(); };
    tick(); clock.hidden = false;
    setInterval(tick, 20000);
  }

  /* ---------- generated project covers ---------- */
  const NS = 'http://www.w3.org/2000/svg';
  const make = (name, attrs = {}) => {
    const n = document.createElementNS(NS, name);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  };
  const seeded = (seed) => () => {
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const W = 320, H = 200;
  const covers = {
    // creator ↔ brand matching graph: one hub, many creators, edges to nearest neighbours
    network(svg, rnd) {
      const nodes = [{ x: W * 0.42, y: H * 0.5, hub: true }];
      let guard = 0;
      while (nodes.length < 20 && guard++ < 600) {
        const c = { x: 22 + rnd() * (W - 44), y: 18 + rnd() * (H - 36) };
        if (nodes.every((n) => Math.hypot(n.x - c.x, n.y - c.y) > 30)) nodes.push(c);
      }
      const seen = new Set();
      const edge = (a, b) => {
        const key = a < b ? `${a}-${b}` : `${b}-${a}`;
        if (seen.has(key)) return; seen.add(key);
        svg.append(make('line', { class: 'edge', x1: nodes[a].x, y1: nodes[a].y, x2: nodes[b].x, y2: nodes[b].y }));
      };
      nodes.forEach((n, i) => {
        const near = nodes.map((m, j) => [Math.hypot(m.x - n.x, m.y - n.y), j]).filter(([, j]) => j !== i).sort((p, q) => p[0] - q[0]);
        near.slice(0, n.hub ? 6 : 2).forEach(([, j]) => edge(i, j));
      });
      nodes.forEach((n) => svg.append(make('circle', { class: n.hub ? 'hub' : 'node', cx: n.x, cy: n.y, r: n.hub ? 5 : 2.6 })));
    },
    // four 256-way codebooks → four rows of semantic-ID cells; the accent marks the codes an item selected
    codebook(svg, rnd) {
      const rows = 4, cols = 16, gap = 4, pad = 14;
      const cw = (W - pad * 2 - gap * (cols - 1)) / cols, ch = (H - pad * 2 - gap * (rows - 1)) / rows;
      for (let r = 0; r < rows; r++) {
        const hot = Math.floor(rnd() * cols);
        for (let c = 0; c < cols; c++) {
          const o = (0.08 + rnd() * 0.6).toFixed(2), o2 = (0.08 + rnd() * 0.6).toFixed(2);
          svg.append(make('rect', {
            class: c === hot ? 'cell hot' : 'cell', x: pad + c * (cw + gap), y: pad + r * (ch + gap), width: cw, height: ch, rx: 2,
            style: c === hot ? '--o:1;--o2:1' : `--o:${o};--o2:${o2};--d:${(rnd() * -1.4).toFixed(2)}s`
          }));
        }
      }
    },
    // citation tree: recursive branching, redrawn root-first on hover
    tree(svg, rnd) {
      const branch = (x, y, angle, len, depth) => {
        const x2 = x + Math.cos(angle) * len, y2 = y + Math.sin(angle) * len;
        svg.append(make('path', { class: 'branch', d: `M${x.toFixed(1)} ${y.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)}`, pathLength: 1, style: `--d:${(depth * 0.14).toFixed(2)}s` }));
        if (depth >= 5) { svg.append(make('circle', { class: 'node', cx: x2, cy: y2, r: 2.2 })); return; }
        const spread = 0.32 + rnd() * 0.42;
        branch(x2, y2, angle - spread * (0.7 + rnd() * 0.6), len * (0.68 + rnd() * 0.1), depth + 1);
        branch(x2, y2, angle + spread * (0.7 + rnd() * 0.6), len * (0.68 + rnd() * 0.1), depth + 1);
      };
      branch(W / 2, H + 2, -Math.PI / 2, 58, 0);
    }
  };
  document.querySelectorAll('[data-cover]').forEach((box, i) => {
    const draw = covers[box.dataset.cover];
    if (!draw) return;
    const svg = make('svg', { viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: 'xMidYMid slice' });
    draw(svg, seeded(101 + i * 7919));
    box.replaceChildren(svg);
  });
})();
