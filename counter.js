/* counter.js — page views and unique visitors, shown as a small rolling odometer.
   Counts live in Abacus (abacus.jasoncameron.dev), a free hit-counter API: no cookies, no signup,
   counters expire only after 6 months without a hit. Keys under the namespace samxiexs.github.io:
     views            one hit per page load
     views-YYYY-MM-DD one hit per page load, per day ("today")
     visitors         one hit per browser (a localStorage flag remembers the first visit)
   Only the real domain increments; localhost just reads. If the service is unreachable the
   line stays hidden. Hover (or tap) the numbers to roll them again. */
(() => {
  const slots = document.querySelectorAll('[data-counter]');
  if (!slots.length || typeof fetch !== 'function') return;
  const API = 'https://abacus.jasoncameron.dev';
  const NS = 'samxiexs.github.io';
  const live = location.hostname === NS;
  const seenKey = 'shen-site-visited';
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date());   // YYYY-MM-DD, Atlanta time
  let firstVisit = false;
  try { firstVisit = !localStorage.getItem(seenKey); } catch {}

  const call = async (op, key) => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 6000);
    try {
      const res = await fetch(`${API}/${op}/${NS}/${key}`, { signal: ctrl.signal });
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json();
      if (typeof data.value !== 'number') throw new Error('bad payload');
      return data.value;
    } finally { clearTimeout(timer); }
  };
  const bump = (key) => call(live ? 'hit' : 'get', key);
  const optional = (p) => p.catch(() => null);

  const fmt = (n) => n.toLocaleString('en-US');
  const el = (tag, cls, txt) => { const n = document.createElement(tag); if (cls) n.className = cls; if (txt != null) n.textContent = txt; return n; };

  // A number as columns of 0–9 that slide to the right digit.
  function odometer(n) {
    const wrap = el('span', 'odo');
    wrap.setAttribute('role', 'img');
    wrap.setAttribute('aria-label', fmt(n));
    for (const ch of fmt(n)) {
      if (!/\d/.test(ch)) { wrap.append(el('span', 'odo-sep', ch)); continue; }
      const col = el('span', 'odo-digit');
      const strip = el('span', 'odo-strip');
      for (let i = 0; i <= 9; i++) strip.append(el('span', null, String(i)));
      col.dataset.d = ch;
      col.append(strip);
      wrap.append(col);
    }
    return wrap;
  }
  function roll(root, reset) {
    const cols = root.querySelectorAll('.odo-digit');
    cols.forEach((col, i) => {
      const strip = col.firstChild;
      strip.style.transitionDelay = `${i * 60}ms`;
      strip.style.transform = reset ? 'translateY(0)' : `translateY(-${col.dataset.d}em)`;
    });
  }
  function spin(root) {
    if (root.dataset.rolling) return;
    root.dataset.rolling = '1';
    roll(root, true);
    setTimeout(() => { roll(root); setTimeout(() => delete root.dataset.rolling, 1400); }, 450);
  }

  function render(slot, { views, visitors, todayViews }) {
    const line = el('span', 'counter-line');
    line.append(odometer(views), el('span', 'counter-label', ' views'));
    if (visitors != null) line.append(el('span', 'counter-label', ' · '), odometer(visitors), el('span', 'counter-label', ' visitors'));
    const sub = el('span', 'counter-sub');
    const detail = todayViews != null ? `today · ${fmt(todayViews)}` : 'since Sep 2026';
    slot.replaceChildren(line, sub);
    slot.hidden = false;
    // First-time visitors get a hello before the line settles into the usual detail.
    if (firstVisit && live && visitors != null) {
      sub.textContent = `hi, you’re visitor #${fmt(visitors)} :)`;
      sub.classList.add('is-hello');
      setTimeout(() => { sub.classList.remove('is-hello'); sub.textContent = detail; }, 6000);
    } else sub.textContent = detail;
    requestAnimationFrame(() => requestAnimationFrame(() => roll(slot)));
    slot.addEventListener('pointerenter', () => spin(slot));
    slot.addEventListener('click', () => spin(slot));
  }

  Promise.all([
    bump('views'),
    optional(bump(`views-${today}`)),
    optional(firstVisit ? bump('visitors') : call('get', 'visitors'))
  ]).then(([views, todayViews, visitors]) => {
    if (live && firstVisit) { try { localStorage.setItem(seenKey, today); } catch {} }
    slots.forEach((slot) => render(slot, { views, visitors, todayViews }));
  }).catch(() => { /* counter service unreachable: keep the line hidden */ });
})();
