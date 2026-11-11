/* Shared map component for Notes pages and native desktop windows. No fetches. */
(() => {
  let instance = 0;
  function mount(host, options = {}) {
    const uid = `cs-map-${++instance}`;
    const data = window.CS_MAP_DATA;
    const nodes = new Map();
    function index(node, parent = null, group = 0) {
      nodes.set(node.id, { ...node, parent, group });
      node.children.forEach((child, i) => index(child, node.id, parent ? group : i));
    }
    index(data);
    const expanded = new Set(['cs']);
    let selected = 'cs', positions = new Map(), listView = false, camera = { x: 0, y: 0, scale: 1 };
    let dimensions = { width: 800, height: 480 }, destroyed = false, drag = null;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const buttons = new Map();
    const root = document.createElement('section'); root.className = 'cs-map'; root.setAttribute('aria-label', 'Computer Science Map');
    root.innerHTML = `
      <header class="cs-map-heading"><p class="cs-eyebrow">NOTES / KNOWLEDGE MAP <span>01</span></p><h1>Computer Science Map<span class="cs-heading-dot" aria-hidden="true">.</span></h1><p>One discipline. Many ways to think.<br>Follow a branch, open an idea, find the connections.</p></header>
      <div class="cs-map-meta"><span>8 areas</span><span>${nodes.size - 1} topics</span><span>Click to explore</span></div>
      <form class="cs-search" role="search" aria-label="Search computer science topics"><label for="${uid}-search">Find a topic</label><div class="cs-search-row"><input id="${uid}-search" type="search" placeholder="Systems, CV, NLP, Transformer…" autocomplete="off"><button type="submit">Find ↵</button></div><div class="cs-search-results" aria-label="Search results" hidden></div></form>
      <div class="cs-quick"><span>Try a path</span><button type="button" data-jump="systems">Systems</button><button type="button" data-jump="cv">CV</button><button type="button" data-jump="nlp">NLP</button><button type="button" data-jump="transformer">Transformer</button></div>
      <div class="cs-map-frame"><div class="cs-map-tools"><span class="cs-map-label">FIELD MAP</span><div><button type="button" data-action="zoom-out" aria-label="Zoom out">−</button><output class="cs-zoom" aria-label="Map zoom">100%</output><button type="button" data-action="zoom-in" aria-label="Zoom in">+</button><button type="button" data-action="fit">Fit</button><button type="button" data-action="reset">Overview</button><button type="button" data-action="list" aria-pressed="false">List view</button></div></div>
        <div class="cs-map-viewport" tabindex="0" aria-label="Interactive map. Drag the background to pan. Use arrow keys to pan, or Tab to reach topics."><div class="cs-map-scene"><svg class="cs-map-edges" aria-hidden="true"></svg><div class="cs-map-nodes"></div></div></div>
        <div class="cs-map-outline" hidden></div><div class="cs-map-caption"><span><i aria-hidden="true"></i> Branches show one way to organize topics.</span><span>Drag to pan · + / − to zoom</span></div>
      </div>
      <section class="cs-detail" aria-label="Selected topic"></section>
      <p class="cs-live sr-only" role="status" aria-live="polite"></p>
      <footer class="cs-map-sources"><b>How to read this map.</b> Fields overlap. “Field”, “method”, and “architecture” labels describe different kinds of ideas; related-topic links cross the branches. Coverage is selective.<br>Broad areas informed by <a href="https://csed.acm.org/knowledge-areas/">ACM / IEEE-CS / AAAI CS2023</a>; the grouping here is editorial. Transformer reference: <a href="https://arxiv.org/abs/1706.03762">Attention Is All You Need</a>.</footer>`;
    host.replaceChildren(root);
    const viewport = root.querySelector('.cs-map-viewport');
    const scene = root.querySelector('.cs-map-scene');
    const svg = root.querySelector('.cs-map-edges');
    const layer = root.querySelector('.cs-map-nodes');
    const detail = root.querySelector('.cs-detail');
    const outline = root.querySelector('.cs-map-outline');
    const search = root.querySelector('input');
    const results = root.querySelector('.cs-search-results');
    const live = root.querySelector('.cs-live');
    const text = (tag, value, className) => { const el = document.createElement(tag); el.textContent = value; if (className) el.className = className; return el; };
    function jumpButton(id, className = '') {
      const button = text('button', nodes.get(id).label, className);
      button.type = 'button'; button.dataset.jump = id; return button;
    }
    function path(id) { const parts = []; for (let n = nodes.get(id); n; n = nodes.get(n.parent)) parts.unshift(n); return parts; }
    function layout() {
      const coords = new Map([['cs', { x: 0, y: 0, side: 1 }]]);
      const children = id => expanded.has(id) ? nodes.get(id).children : [];
      const span = id => Math.max(96, children(id).reduce((sum, n) => sum + span(n.id), 0));
      const place = (id, side, depth, top) => {
        const height = span(id); coords.set(id, { x: side * depth * 254, y: top + height / 2, side });
        let cursor = top;
        for (const child of children(id)) { place(child.id, side, depth + 1, cursor); cursor += span(child.id); }
      };
      for (const [side, branches] of [[-1, data.children.slice(0, 4)], [1, data.children.slice(4)]]) {
        let top = -branches.reduce((sum, n) => sum + span(n.id), 0) / 2;
        for (const child of branches) { place(child.id, side, 1, top); top += span(child.id); }
      }
      const minX = Math.min(...[...coords.values()].map(p => p.x)) - 140;
      const minY = Math.min(...[...coords.values()].map(p => p.y)) - 65;
      dimensions = { width: Math.max(...[...coords.values()].map(p => p.x)) - minX + 140, height: Math.max(...[...coords.values()].map(p => p.y)) - minY + 65 };
      positions = new Map([...coords].map(([id, p]) => [id, { ...p, x: p.x - minX, y: p.y - minY }]));
    }
    function setCamera(animate = true) {
      // The camera owns panning; native focus scrolling must not add a second offset.
      viewport.scrollLeft = 0; viewport.scrollTop = 0;
      scene.classList.toggle('cs-camera-motion', animate && !reduced.matches);
      scene.style.transform = `translate(${camera.x}px, ${camera.y}px) scale(${camera.scale})`;
      root.querySelector('.cs-zoom').value = `${Math.round(camera.scale * 100)}%`;
    }
    function fit() {
      if (!viewport.clientWidth) return;
      camera.scale = Math.min(1, (viewport.clientWidth - 26) / dimensions.width, (viewport.clientHeight - 26) / dimensions.height);
      camera.x = (viewport.clientWidth - dimensions.width * camera.scale) / 2;
      camera.y = (viewport.clientHeight - dimensions.height * camera.scale) / 2;
      setCamera();
    }
    function center(id, animate = true) {
      const p = positions.get(id); if (!p || !viewport.clientWidth) return;
      camera.scale = Math.min(1, Math.max(.75, viewport.clientWidth / 850));
      camera.x = viewport.clientWidth / 2 - p.x * camera.scale;
      camera.y = viewport.clientHeight / 2 - p.y * camera.scale;
      setCamera(animate);
    }
    function zoom(factor) {
      const old = camera.scale, next = Math.max(.18, Math.min(1.8, old * factor));
      camera.x = viewport.clientWidth / 2 - (viewport.clientWidth / 2 - camera.x) * next / old;
      camera.y = viewport.clientHeight / 2 - (viewport.clientHeight / 2 - camera.y) * next / old;
      camera.scale = next; setCamera();
    }
    function renderDetail() {
      const n = nodes.get(selected); detail.replaceChildren(); detail.dataset.group = n.group;
      const crumbs = document.createElement('nav'); crumbs.className = 'cs-breadcrumbs'; crumbs.setAttribute('aria-label', 'Topic path');
      for (const [i, node] of path(selected).entries()) { if (i) crumbs.append(text('span', ' / ', 'cs-path-separator')); const b = jumpButton(node.id); if (node.id === selected) b.setAttribute('aria-current', 'true'); crumbs.append(b); }
      const top = document.createElement('div'); top.className = 'cs-detail-top';
      const title = text('h2', n.label); title.tabIndex = -1;
      const badge = text('span', n.kind, 'cs-kind'); top.append(title, badge);
      const description = text('p', n.summary, 'cs-description');
      const examples = document.createElement('ul'); examples.className = 'cs-examples'; n.examples.forEach(v => examples.append(text('li', v)));
      detail.append(crumbs, top, text('p', n.zh, 'cs-topic-zh'), description, examples);
      if (n.children.length) {
        detail.append(text('h3', 'Explore this branch', 'cs-small-title'));
        const next = document.createElement('div'); next.className = 'cs-related'; n.children.forEach(child => next.append(jumpButton(child.id))); detail.append(next);
      }
      if (n.related.length) {
        detail.append(text('h3', 'Across the map', 'cs-small-title'));
        const related = document.createElement('div'); related.className = 'cs-related cs-cross-links'; n.related.forEach(id => related.append(jumpButton(id))); detail.append(related);
      }
      if (!reduced.matches) detail.animate([{ opacity: .5, transform: 'translateY(5px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 220 });
    }
    function renderOutline() {
      outline.replaceChildren();
      function build(node) {
        const li = document.createElement('li'); const button = jumpButton(node.id);
        button.dataset.node = node.id; delete button.dataset.jump;
        button.setAttribute('aria-pressed', String(node.id === selected));
        if (node.children.length && node.id !== 'cs') { button.setAttribute('aria-expanded', String(expanded.has(node.id))); button.prepend(text('span', expanded.has(node.id) ? '− ' : '+ ')); }
        li.append(button);
        if (expanded.has(node.id) && node.children.length) { const ul = document.createElement('ul'); node.children.forEach(child => ul.append(build(child))); li.append(ul); }
        return li;
      }
      const ul = document.createElement('ul'); ul.append(build(data)); outline.append(ul);
      if (listView) revealOutlineSelection();
    }
    function revealOutlineSelection() {
      const button = outline.querySelector(`[data-node="${selected}"]`);
      if (!button) return;
      const rect = button.getBoundingClientRect(), bounds = outline.getBoundingClientRect();
      if (rect.top < bounds.top || rect.bottom > bounds.bottom) outline.scrollTop += rect.top - bounds.top - outline.clientHeight / 2 + rect.height / 2;
    }
    function render() {
      layout();
      const ancestors = new Set(path(selected).map(n => n.id));
      scene.style.width = `${dimensions.width}px`; scene.style.height = `${dimensions.height}px`;
      svg.setAttribute('width', dimensions.width); svg.setAttribute('height', dimensions.height); svg.replaceChildren();
      for (const [id, p] of positions) {
        const node = nodes.get(id); let button = buttons.get(id);
        if (!button) {
          button = document.createElement('button'); button.type = 'button'; button.className = 'cs-node'; button.dataset.node = id;
          button.append(text('span', node.kind, 'cs-node-kind'), text('span', node.label, 'cs-node-title'), text('span', '', 'cs-node-toggle'));
          button.setAttribute('aria-controls', `${uid}-detail`); buttons.set(id, button); layer.append(button);
        }
        button.dataset.group = node.group; button.hidden = false;
        button.classList.toggle('is-selected', id === selected); button.classList.toggle('is-path', ancestors.has(id));
        button.setAttribute('aria-pressed', String(id === selected));
        if (node.children.length && id !== 'cs') button.setAttribute('aria-expanded', String(expanded.has(id)));
        button.querySelector('.cs-node-toggle').textContent = id === 'cs' ? '⌂' : node.children.length ? (expanded.has(id) ? '−' : '+') : '·';
        button.style.transform = `translate(${p.x - 104}px, ${p.y - 33}px)`;
        if (node.parent) {
          const parent = positions.get(node.parent), edge = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          const startX = parent.x + 104 * p.side, endX = p.x - 104 * p.side, midX = (startX + endX) / 2;
          edge.setAttribute('d', `M ${startX} ${parent.y} C ${midX} ${parent.y}, ${midX} ${p.y}, ${endX} ${p.y}`);
          edge.setAttribute('class', ancestors.has(id) ? 'cs-edge is-path' : 'cs-edge'); edge.dataset.group = node.group; svg.append(edge);
        }
      }
      for (const [id, button] of buttons) button.hidden = !positions.has(id);
      detail.id = `${uid}-detail`; renderDetail(); renderOutline();
    }
    function select(id, toggle = false, returnFocus = false) {
      if (!nodes.has(id)) return;
      const n = nodes.get(id);
      path(id).slice(0, -1).forEach(a => expanded.add(a.id));
      if (n.children.length && id !== 'cs') { if (toggle && expanded.has(id)) expanded.delete(id); else expanded.add(id); }
      selected = id; render(); if (id === 'cs') fit(); else center(id);
      live.textContent = `${n.label}. ${n.kind}. ${n.children.length ? `${expanded.has(id) ? 'Expanded' : 'Collapsed'} ${n.children.length} subtopics.` : 'Topic selected.'}`;
      options.onSelect?.(id);
      if (returnFocus) {
        const target = listView ? outline.querySelector(`[data-node="${id}"]`) : buttons.get(id);
        target?.focus({ preventScroll: true });
      }
      const button = buttons.get(id);
      if (button && !reduced.matches) button.animate([{ scale: 1 }, { scale: 1.04 }, { scale: 1 }], { duration: 280, easing: 'ease-out' });
    }
    function matches() {
      const q = search.value.trim().toLowerCase();
      if (!q) return [];
      return [...nodes.values()].filter(n => `${n.label} ${n.zh} ${n.kind}`.toLowerCase().includes(q)).slice(0, 10);
    }
    search.addEventListener('input', () => {
      results.replaceChildren(); const found = matches(); results.hidden = !search.value.trim();
      if (results.hidden) return;
      if (!found.length) results.append(text('p', 'No matching topics. Try “systems”, “NLP”, or “注意力”.'));
      for (const node of found) { const b = jumpButton(node.id); b.append(text('small', path(node.id).slice(0, -1).map(n => n.label).join(' / '))); results.append(b); }
      live.textContent = `${found.length} matching topics${found.length === 10 ? ' (showing up to 10)' : ''}.`;
    });
    search.addEventListener('keydown', e => { if (e.key === 'Escape') { search.value = ''; results.hidden = true; } });
    root.querySelector('form').addEventListener('submit', e => {
      e.preventDefault(); const first = matches()[0];
      if (first) { results.hidden = true; select(first.id); detail.querySelector('h2').focus({ preventScroll: true }); }
    });
    root.addEventListener('click', e => {
      const node = e.target.closest('[data-node]'); if (node) { select(node.dataset.node, true, true); return; }
      const jump = e.target.closest('[data-jump]'); if (jump) { results.hidden = true; select(jump.dataset.jump); detail.querySelector('h2').focus({ preventScroll: true }); return; }
      const action = e.target.closest('[data-action]')?.dataset.action;
      if (action === 'zoom-in') zoom(1.2);
      if (action === 'zoom-out') zoom(1 / 1.2);
      if (action === 'fit') fit();
      if (action === 'reset') { expanded.clear(); expanded.add('cs'); select('cs'); }
      if (action === 'list') {
        listView = !listView; viewport.hidden = listView; outline.hidden = !listView;
        root.querySelector('.cs-map-frame').classList.toggle('is-list', listView);
        root.querySelector('.cs-map-label').textContent = listView ? 'TOPIC OUTLINE' : 'FIELD MAP';
        const control = root.querySelector('[data-action="list"]'); control.textContent = listView ? 'Map view' : 'List view'; control.setAttribute('aria-pressed', String(listView));
        if (listView) revealOutlineSelection(); else if (selected === 'cs') fit(); else center(selected);
      }
    });
    root.addEventListener('keydown', e => {
      const id = e.target.closest('[data-node]')?.dataset.node;
      if (!id) return;
      const node = nodes.get(id); let next;
      if (e.key === 'ArrowLeft') next = node.parent;
      if (e.key === 'ArrowRight') next = node.children[0]?.id;
      if (['ArrowUp', 'ArrowDown'].includes(e.key) && node.parent) {
        const siblings = nodes.get(node.parent).children, offset = e.key === 'ArrowUp' ? -1 : 1;
        next = siblings[(siblings.findIndex(n => n.id === id) + offset + siblings.length) % siblings.length].id;
      }
      if (next) { e.preventDefault(); select(next, false, true); }
    });
    viewport.addEventListener('focusin', e => {
      const button = e.target.closest('[data-node]');
      if (!button) return;
      const rect = button.getBoundingClientRect(), bounds = viewport.getBoundingClientRect();
      if (rect.left < bounds.left || rect.right > bounds.right || rect.top < bounds.top || rect.bottom > bounds.bottom) center(button.dataset.node, false);
    });
    viewport.addEventListener('keydown', e => {
      if (e.target !== viewport) return;
      const delta = { ArrowLeft: [45, 0], ArrowRight: [-45, 0], ArrowUp: [0, 45], ArrowDown: [0, -45] }[e.key];
      if (delta) { e.preventDefault(); camera.x += delta[0]; camera.y += delta[1]; setCamera(); }
      if (e.key === '+' || e.key === '=') { e.preventDefault(); zoom(1.2); }
      if (e.key === '-') { e.preventDefault(); zoom(1 / 1.2); }
    });
    viewport.addEventListener('pointerdown', e => {
      if (e.target.closest('button') || e.button !== 0) return;
      drag = { x: e.clientX, y: e.clientY, cx: camera.x, cy: camera.y };
      viewport.setPointerCapture(e.pointerId); viewport.classList.add('is-dragging');
    });
    viewport.addEventListener('pointermove', e => {
      if (!drag) return; camera.x = drag.cx + e.clientX - drag.x; camera.y = drag.cy + e.clientY - drag.y; setCamera(false);
    });
    const stopDrag = () => { drag = null; viewport.classList.remove('is-dragging'); };
    viewport.addEventListener('pointerup', stopDrag); viewport.addEventListener('pointercancel', stopDrag);
    const observer = new ResizeObserver(() => { if (!destroyed && !listView && viewport.clientWidth) { if (selected === 'cs') fit(); else center(selected, false); } });
    observer.observe(viewport);
    render(); fit();
    if (options.initial && nodes.has(options.initial)) select(options.initial);
    return { select: id => select(id), destroy: () => { destroyed = true; observer.disconnect(); root.remove(); } };
  }
  window.CSMap = { mount };
  document.querySelectorAll('[data-cs-map]').forEach(host => {
    const initial = location.hash.startsWith('#topic=') ? location.hash.slice(7) : 'cs';
    const map = mount(host, { initial, onSelect: id => {
      try { history.replaceState(null, '', id === 'cs' ? location.pathname + location.search : `#topic=${id}`); } catch {}
    } });
    window.addEventListener('hashchange', () => { if (location.hash.startsWith('#topic=')) map.select(location.hash.slice(7)); });
  });
})();
