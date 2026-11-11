/* Apply before paint; the desktop preference is independent of Modern mode. */
(() => {
  let night = false;
  try { night = localStorage.getItem('shen-desktop-night') === 'true'; } catch {}
  function apply() {
    document.documentElement.dataset.night = String(night);
    const button = document.querySelector('#night-toggle');
    if (button) { button.textContent = night ? 'Day mode' : 'Night mode'; button.setAttribute('aria-pressed', String(night)); }
  }
  apply();
  document.addEventListener('DOMContentLoaded', () => {
    apply();
    document.querySelector('#night-toggle').addEventListener('click', () => {
      night = !night; apply();
      try { localStorage.setItem('shen-desktop-night', String(night)); } catch {}
    });
  });
  window.addEventListener('storage', e => {
    if (e.key === 'shen-desktop-night' || e.key === null) { night = e.newValue === 'true'; apply(); }
  });
})();
