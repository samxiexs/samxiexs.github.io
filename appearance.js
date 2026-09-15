/* appearance.js — visitor appearance controls (theme / accent / font / text size).
   Loaded synchronously in <head> so the saved settings apply before first paint.
   Theme changes use the View Transitions API (where available) for a circular reveal
   that expands from the control; browsers without it simply switch. */
(() => {
  const key = 'shen-site-appearance';
  // Accent pairs are [light, dark]; keep in sync with the data-accent rules in style.css.
  const accents = {
    blue: ['#1d4ed8', '#8ab4ff'],
    green: ['#15803d', '#7dd3a0'],
    gold: ['#9a6b00', '#e6c25a'],
    rose: ['#be123c', '#ff90a8'],
    ink: ['#111318', '#e6e8ee']
  };
  const defaults = { theme: 'system', accent: 'blue', font: 'default', size: 100 };
  const validate = (value = {}) => ({
    theme: ['system', 'light', 'dark'].includes(value?.theme) ? value.theme : 'system',
    accent: value?.accent in accents ? value.accent : 'blue',
    font: value?.font === 'mono' ? 'mono' : 'default',
    size: [90, 95, 100, 105, 110].includes(value?.size) ? value.size : 100
  });
  let settings = { ...defaults };
  try { settings = validate(JSON.parse(localStorage.getItem(key))); } catch {}
  const system = matchMedia('(prefers-color-scheme: dark)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const root = document.documentElement;

  const isDark = () => settings.theme === 'dark' || (settings.theme === 'system' && system.matches);
  function apply() {
    root.dataset.theme = settings.theme;
    root.dataset.accent = settings.accent;
    root.dataset.font = settings.font;
    root.style.fontSize = `${settings.size}%`;
    document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => meta.remove());
    const meta = document.createElement('meta');
    meta.name = 'theme-color'; meta.content = isDark() ? '#161b26' : '#ffffff';
    document.head.append(meta);
  }
  // Circular reveal from (x, y) when the rendered scheme actually changes.
  function applyFrom(x, y) {
    const current = root.dataset.theme;
    const before = current === 'dark' || (current !== 'light' && system.matches);
    if (!document.startViewTransition || reduced.matches || before === isDark()) { apply(); return; }
    root.style.setProperty('--vt-x', `${x}px`);
    root.style.setProperty('--vt-y', `${y}px`);
    document.startViewTransition(() => apply());
  }
  apply();
  system.addEventListener('change', apply);

  document.addEventListener('DOMContentLoaded', () => {
    const panel = document.createElement('details');
    panel.className = 'appearance';
    const swatches = Object.entries(accents).map(([name, [light, dark]]) =>
      `<label style="--sw:light-dark(${light},${dark})" title="${name}"><input type="radio" name="site-accent" value="${name}" aria-label="${name}"></label>`).join('');
    panel.innerHTML = `<summary>Appearance</summary><div class="appearance-panel">
      <label for="site-theme">Theme</label><select id="site-theme"><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select>
      <span class="swatches-label" id="site-accent-label">Accent</span><fieldset class="swatches" aria-labelledby="site-accent-label">${swatches}</fieldset>
      <label for="site-font">Font</label><select id="site-font"><option value="default">Default</option><option value="mono">Mono</option></select>
      <label for="site-size">Text size</label><select id="site-size"><option value="90">90%</option><option value="95">95%</option><option value="100">100%</option><option value="105">105%</option><option value="110">110%</option></select>
      <button type="button">Reset</button></div>`;
    (document.querySelector('.sidebar-foot') || document.querySelector('main')).append(panel);
    const theme = panel.querySelector('#site-theme');
    const font = panel.querySelector('#site-font');
    const size = panel.querySelector('#site-size');
    const radios = [...panel.querySelectorAll('input[name="site-accent"]')];
    const center = (el) => { const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };
    function sync() {
      theme.value = settings.theme; font.value = settings.font; size.value = settings.size;
      radios.forEach((r) => { r.checked = r.value === settings.accent; });
    }
    function save(origin) {
      if (origin) applyFrom(...origin); else apply();
      try { localStorage.setItem(key, JSON.stringify(settings)); } catch {}
    }
    sync();
    panel.addEventListener('change', (event) => {
      const accent = radios.find((r) => r.checked)?.value;
      const wanted = validate({ theme: theme.value, accent, font: font.value, size: Number(size.value) });
      const themeChanged = wanted.theme !== settings.theme;
      settings = wanted;
      save(themeChanged ? center(event.target) : null);
    });
    panel.querySelector('button').addEventListener('click', (event) => {
      settings = { ...defaults }; sync(); save(center(event.currentTarget));
    });
    panel.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') { panel.open = false; panel.querySelector('summary').focus(); }
    });
    document.addEventListener('click', (event) => { if (!panel.contains(event.target)) panel.open = false; });
    window.addEventListener('storage', (event) => {
      if (event.key !== key && event.key !== null) return;
      try { settings = validate(JSON.parse(event.newValue)); } catch { settings = { ...defaults }; }
      sync(); apply();
    });
  });
})();
