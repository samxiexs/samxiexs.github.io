/* appearance.js — visitor appearance controls (theme / font / text size).
   Loaded synchronously in <head> so the saved settings apply before first paint.
   Theme changes cross-fade colours via a short-lived .theme-fade class on <html>. */
(() => {
  const key = 'shen-site-appearance';
  const defaults = { mode: 'retro', theme: 'system', font: 'default', size: 100 };
  const validate = (value = {}) => ({
    mode: value?.mode === 'modern' ? 'modern' : 'retro',
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
    root.dataset.mode = settings.mode;
    root.dataset.theme = settings.theme;
    root.dataset.font = settings.font;
    // OpenDyslexic is much wider than Inter, so shrink the whole type scale a little when it is on.
    root.style.fontSize = `${settings.size * (settings.font === 'dyslexic' ? 0.87 : 1)}%`;
    document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => meta.remove());
    const meta = document.createElement('meta');
    meta.name = 'theme-color'; meta.content = settings.mode === 'retro' ? '#008080' : isDark() ? '#161b26' : '#fcfdff';
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
    const toolbar = document.createElement('header');
    toolbar.className = 'desktop-toolbar';
    toolbar.innerHTML = `<div class="desktop-title"><span class="computer-icon" aria-hidden="true"></span><span>Shen Xie <span class="desktop-subtitle">— Personal Homepage</span></span></div><button class="mode-toggle" type="button"></button>`;
    const desktopLink = document.createElement('a');
    desktopLink.className = 'desktop-mode-link';
    desktopLink.href = new URL('index.html', document.querySelector('script[src$="appearance.js"]').src).href;
    if (document.body.dataset.desktopApp) desktopLink.hash = document.body.dataset.desktopApp;
    desktopLink.textContent = 'Explore Desktop ↗';
    toolbar.insertBefore(desktopLink, toolbar.querySelector('button'));
    document.body.prepend(toolbar);
    const toggle = toolbar.querySelector('button');
    const taskbar = document.createElement('div');
    taskbar.className = 'desktop-taskbar';
    taskbar.innerHTML = `<a class="desktop-home" href="#top"><span aria-hidden="true">▣</span> Start</a><span class="desktop-task">Shen Xie · Personal Homepage</span><span class="desktop-status">Welcome to my corner of the web.</span><span class="desktop-edition">98 EDITION</span>`;
    document.body.append(taskbar);
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
      toggle.textContent = settings.mode === 'retro' ? 'Switch to Modern ↗' : 'Switch to Windows 98';
      toggle.setAttribute('aria-label', settings.mode === 'retro' ? 'Switch to modern mode' : 'Switch to Windows 98 mode');
      theme.disabled = settings.mode === 'retro';
      theme.title = settings.mode === 'retro' ? 'Color scheme applies in Modern mode' : '';
      theme.value = settings.theme; font.value = settings.font; size.value = settings.size;
    }
    function save(animate) {
      if (animate) applyAnimated(); else apply();
      try { localStorage.setItem(key, JSON.stringify(settings)); } catch {}
    }
    sync();
    toggle.addEventListener('click', () => {
      settings.mode = settings.mode === 'retro' ? 'modern' : 'retro';
      panel.open = false;
      sync(); save(false);
      window.dispatchEvent(new Event('resize'));
    });
    panel.addEventListener('change', (event) => {
      const wanted = validate({ mode: settings.mode, theme: theme.value, font: font.value, size: Number(size.value) });
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
