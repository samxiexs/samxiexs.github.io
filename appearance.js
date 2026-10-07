/* appearance.js — visitor appearance controls (theme / font / text size).
   Loaded synchronously in <head> so the saved settings apply before first paint.
   Theme changes cross-fade colours via a short-lived .theme-fade class on <html>. */
(() => {
  const key = 'shen-site-appearance';
  const defaults = { theme: 'system', font: 'default', size: 100 };
  const validate = (value = {}) => ({
    theme: ['system', 'light', 'dark'].includes(value?.theme) ? value.theme : 'system',
    font: ['default', 'inter', 'mono', 'dyslexic'].includes(value?.font) ? value.font : 'default',
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
    root.dataset.font = settings.font;
    // OpenDyslexic is much wider than Inter, so shrink the whole type scale a little when it is on.
    root.style.fontSize = `${settings.size * (settings.font === 'dyslexic' ? 0.87 : 1)}%`;
    document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => meta.remove());
    const meta = document.createElement('meta');
    meta.name = 'theme-color'; meta.content = isDark() ? '#161b26' : '#fcfdff';
    document.head.append(meta);
  }
  // Cross-fade colours when the rendered scheme actually changes (see .theme-fade in style.css).
  let fadeTimer = 0;
  function applyAnimated() {
    const current = root.dataset.theme;
    const before = current === 'dark' || (current !== 'light' && system.matches);
    if (reduced.matches || before === isDark()) { apply(); return; }
    root.classList.add('theme-fade');
    apply();
    clearTimeout(fadeTimer);
    fadeTimer = setTimeout(() => root.classList.remove('theme-fade'), 450);
  }
  apply();
  system.addEventListener('change', applyAnimated);

  document.addEventListener('DOMContentLoaded', () => {
    const panel = document.createElement('details');
    panel.className = 'appearance';
    panel.innerHTML = `<summary>Appearance</summary><div class="appearance-panel">
      <label for="site-theme">Theme</label><select id="site-theme"><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select>
      <label for="site-font">Font</label><select id="site-font"><option value="default">Lato</option><option value="inter">Inter</option><option value="mono">Mono</option><option value="dyslexic">OpenDyslexic</option></select>
      <label for="site-size">Text size</label><select id="site-size"><option value="90">90%</option><option value="95">95%</option><option value="100">100%</option><option value="105">105%</option><option value="110">110%</option></select>
      <button type="button">Reset</button></div>`;
    (document.querySelector('.sidebar-foot') || document.querySelector('main')).append(panel);
    const theme = panel.querySelector('#site-theme');
    const font = panel.querySelector('#site-font');
    const size = panel.querySelector('#site-size');
    function sync() {
      theme.value = settings.theme; font.value = settings.font; size.value = settings.size;
    }
    function save(animate) {
      if (animate) applyAnimated(); else apply();
      try { localStorage.setItem(key, JSON.stringify(settings)); } catch {}
    }
    sync();
    panel.addEventListener('change', (event) => {
      const wanted = validate({ theme: theme.value, font: font.value, size: Number(size.value) });
      const themeChanged = wanted.theme !== settings.theme;
      settings = wanted;
      save(themeChanged);
    });
    panel.querySelector('button').addEventListener('click', () => {
      settings = { ...defaults }; sync(); save(true);
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
