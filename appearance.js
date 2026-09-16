/* appearance.js — visitor appearance controls (theme / accent / font / text size).
   Loaded synchronously in <head> so the saved settings apply before first paint.
   Theme changes cross-fade colours via a short-lived .theme-fade class on <html>. */
(() => {
  const key = 'shen-site-appearance';
  // Accent pairs are [light, dark]; keep in sync with the data-accent rules in style.css.
  const accents = {
    blue: ['#2456a5', '#82a8f4'],
    green: ['#1e6b45', '#7cc79c'],
    gold: ['#8a6414', '#d9b05a'],
    rose: ['#9b2246', '#ea97ae'],
    ink: ['#1a1d24', '#e8eaf0']
  };
  const defaults = { theme: 'system', accent: 'blue', font: 'default', size: 100 };
  const validate = (value = {}) => ({
    theme: ['system', 'light', 'dark'].includes(value?.theme) ? value.theme : 'system',
    accent: value?.accent in accents ? value.accent : 'blue',
    font: ['default', 'mono', 'dyslexic'].includes(value?.font) ? value.font : 'default',
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
    const swatches = Object.entries(accents).map(([name, [light, dark]]) =>
      `<label style="--sw:light-dark(${light},${dark})" title="${name}"><input type="radio" name="site-accent" value="${name}" aria-label="${name}"></label>`).join('');
    panel.innerHTML = `<summary>Appearance</summary><div class="appearance-panel">
      <label for="site-theme">Theme</label><select id="site-theme"><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select>
      <span class="swatches-label" id="site-accent-label">Accent</span><fieldset class="swatches" aria-labelledby="site-accent-label">${swatches}</fieldset>
      <label for="site-font">Font</label><select id="site-font"><option value="default">Default</option><option value="mono">Mono</option><option value="dyslexic">OpenDyslexic</option></select>
      <label for="site-size">Text size</label><select id="site-size"><option value="90">90%</option><option value="95">95%</option><option value="100">100%</option><option value="105">105%</option><option value="110">110%</option></select>
      <button type="button">Reset</button></div>`;
    (document.querySelector('.sidebar-foot') || document.querySelector('main')).append(panel);
    const theme = panel.querySelector('#site-theme');
    const font = panel.querySelector('#site-font');
    const size = panel.querySelector('#site-size');
    const radios = [...panel.querySelectorAll('input[name="site-accent"]')];
    function sync() {
      theme.value = settings.theme; font.value = settings.font; size.value = settings.size;
      radios.forEach((r) => { r.checked = r.value === settings.accent; });
    }
    function save(animate) {
      if (animate) applyAnimated(); else apply();
      try { localStorage.setItem(key, JSON.stringify(settings)); } catch {}
    }
    sync();
    panel.addEventListener('change', (event) => {
      const accent = radios.find((r) => r.checked)?.value;
      const wanted = validate({ theme: theme.value, accent, font: font.value, size: Number(size.value) });
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
