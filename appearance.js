(() => {
  const key = 'shen-site-appearance';
  const defaults = { theme: 'system', font: 'default', size: 100 };
  const validate = (value = {}) => ({
    theme: ['system', 'light', 'dark'].includes(value?.theme) ? value.theme : 'system',
    font: value?.font === 'mono' ? 'mono' : 'default',
    size: [90, 95, 100, 105, 110].includes(value?.size) ? value.size : 100
  });
  let settings = { ...defaults };
  try { settings = validate(JSON.parse(localStorage.getItem(key))); } catch {}
  const system = matchMedia('(prefers-color-scheme: dark)');
  function apply() {
    const root = document.documentElement;
    root.dataset.theme = settings.theme;
    root.dataset.font = settings.font;
    root.style.fontSize = `${settings.size}%`;
    const dark = settings.theme === 'dark' || (settings.theme === 'system' && system.matches);
    document.querySelectorAll('meta[name="theme-color"]').forEach(meta => meta.remove());
    const meta = document.createElement('meta');
    meta.name = 'theme-color'; meta.content = dark ? '#191d1b' : '#f8f7f4';
    document.head.append(meta);
  }
  apply();
  system.addEventListener('change', apply);
  document.addEventListener('DOMContentLoaded', () => {
    const panel = document.createElement('details');
    panel.className = 'appearance';
    panel.innerHTML = `<summary>Appearance</summary><div class="appearance-panel">
      <label for="site-theme">Theme</label><select id="site-theme"><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select>
      <label for="site-font">Font</label><select id="site-font"><option value="default">Default</option><option value="mono">Mono</option></select>
      <label for="site-size">Text size</label><select id="site-size"><option value="90">90%</option><option value="95">95%</option><option value="100">100%</option><option value="105">105%</option><option value="110">110%</option></select>
      <button type="button">Reset</button></div>`;
    (document.querySelector('.header-inner') || document.querySelector('main')).append(panel);
    const theme = panel.querySelector('#site-theme');
    const font = panel.querySelector('#site-font');
    const size = panel.querySelector('#site-size');
    function sync() { theme.value = settings.theme; font.value = settings.font; size.value = settings.size; }
    function save() { apply(); try { localStorage.setItem(key, JSON.stringify(settings)); } catch {} }
    sync();
    panel.addEventListener('change', () => {
      settings = validate({ theme: theme.value, font: font.value, size: Number(size.value) }); save();
    });
    panel.querySelector('button').addEventListener('click', () => { settings = { ...defaults }; sync(); save(); });
    panel.addEventListener('keydown', event => {
      if (event.key === 'Escape') { panel.open = false; panel.querySelector('summary').focus(); }
    });
    document.addEventListener('click', event => { if (!panel.contains(event.target)) panel.open = false; });
    window.addEventListener('storage', event => {
      if (event.key !== key && event.key !== null) return;
      try { settings = validate(JSON.parse(event.newValue)); } catch { settings = { ...defaults }; }
      sync(); apply();
    });
  });
})();
