/* Homepage content is embedded by scripts/sync-desktop-content.py.
   Opening a window never depends on a live server or a second page request. */
(() => {
  const apps = {
    welcome: { title: 'Welcome', icon: 'computer', label: 'My Homepage' },
    about: { title: 'About Shen', icon: 'person', selector: '#about' },
    research: { title: 'Research', icon: 'folder', selector: '#research' },
    projects: { title: 'Projects', icon: 'folder', selector: '#projects' },
    experience: { title: 'Education & Experience', icon: 'document', selector: '#experience' },
    photos: { title: 'My Pictures', icon: 'picture' },
    misc: { title: 'Misc & Notes', label: 'Misc & Notes', icon: 'folder' },
    'cs-map': { title: 'Computer Science Map', icon: 'document', hideDesktopIcon: true },
    contact: { title: 'Contact & Links', icon: 'mail' },
    credits: { title: 'About this Desktop', icon: 'document' }
  };
  const workspace = document.querySelector('#workspace');
  const windows = document.querySelector('#windows');
  const icons = document.querySelector('#desktop-icons');
  const tasks = document.querySelector('#tasks');
  const menu = document.querySelector('#start-menu');
  const start = document.querySelector('#start-button');
  const state = new Map();
  let highest = 1;
  const iconFiles = { computer: 'my-computer', person: 'internet-explorer', folder: 'my-documents-folder', document: 'notepad-file', picture: 'folder', mail: 'network' };
  const icon = (kind, size = 32) => `<img class="pixel-icon" src="assets/retro/icons/${iconFiles[kind]}-${size}.png" width="${size}" height="${size}" alt="" draggable="false">`;
  const announce = (message) => { document.querySelector('#os-announcement').textContent = message; };
  function setMenu(open) { menu.hidden = !open; start.setAttribute('aria-expanded', String(open)); }
  function updateExitLinks(item) {
    const href = item.id === 'cs-map' ? `notes/computer-science.html${item.topic && item.topic !== 'cs' ? '#topic=' + item.topic : ''}` : item.id === 'misc' ? 'misc.html#notes' : 'website.html';
    document.querySelectorAll('[data-exit]').forEach(link => { link.href = href; });
  }
  function focusWindow(item, focus = true) {
    item.el.hidden = false;
    updateExitLinks(item);
    item.el.style.zIndex = ++highest;
    state.forEach((w) => { w.el.classList.toggle('active', w === item); w.task.setAttribute('aria-pressed', String(w === item)); });
    if (focus) item.el.focus({ preventScroll: true });
  }
  function minimize(item) {
    item.el.hidden = true;
    item.task.setAttribute('aria-pressed', 'false');
    const next = [...state.values()].filter(w => !w.el.hidden).sort((a,b) => Number(b.el.style.zIndex) - Number(a.el.style.zIndex))[0];
    if (next) focusWindow(next); else item.task.focus();
    announce(`${item.app.title} minimized. Restore it from the taskbar.`);
  }
  function clamp(item) {
    const bounds = workspace.getBoundingClientRect();
    const rect = item.el.getBoundingClientRect();
    item.el.style.left = `${Math.max(0, Math.min(parseFloat(item.el.style.left) || 0, bounds.width - rect.width))}px`;
    item.el.style.top = `${Math.max(0, Math.min(parseFloat(item.el.style.top) || 0, bounds.height - Math.min(rect.height, bounds.height)))}px`;
  }
  function maximize(item) {
    item.el.classList.toggle('maximized');
    const max = item.el.classList.contains('maximized');
    item.el.querySelector('[data-control="maximize"]').setAttribute('aria-label', `${max ? 'Restore' : 'Maximize'} ${item.app.title}`);
    if (!max) clamp(item);
  }
  function fill(item) {
    const body = item.el.querySelector('.os-window-body');
    if (item.app.selector) {
      body.textContent = 'Opening file…';
      try {
        const template = document.querySelector('#desktop-content');
        const section = template?.content.querySelector(item.app.selector);
        if (!section) throw new Error(`Missing embedded section: ${item.id}`);
        const content = section.cloneNode(true);
        content.querySelectorAll('canvas, .field-hint, .cover').forEach(el => el.remove());
        content.querySelectorAll('[data-tilt]').forEach(el => el.removeAttribute('data-tilt'));
        body.replaceChildren(content);
      } catch {
        body.innerHTML = '<p>This file could not be opened.</p><button type="button" class="retry">Try again</button> <a href="website.html">Read the website →</a>';
        body.querySelector('.retry').onclick = () => fill(item);
      }
    } else if (item.id === 'welcome') {
      body.innerHTML = `<div class="welcome-layout"><aside class="welcome-side"><img src="assets/retro/icons/my-computer-32.png" width="32" height="32" alt=""><span>Shen's<br><strong>Desktop 98</strong></span><small>Personal Edition</small></aside><div class="welcome-content"><h1>Welcome to Shen's desktop</h1><p class="welcome-intro">Hi, I'm <b>Shen (Sam) Xie</b>, a student in Computational Science & Engineering at <b>Georgia Tech</b>.</p><p>I work on AI for science, multimodal learning, human-centered AI, and computational social science.</p><p class="welcome-prompt">Choose a place to start:</p><div class="welcome-shortcuts"><button data-open="about">${icon('person')}<span><b>About me</b><small>My background, interests and a little introduction.</small></span></button><button data-open="research">${icon('folder')}<span><b>Explore my research</b><small>Open the folder to see what I'm working on.</small></span></button><button data-open="projects">${icon('document')}<span><b>Projects & experiments</b><small>Things I've built, with links to the code.</small></span></button></div><p class="desktop-tip">Tip: click a desktop icon to open it. Drag a title bar to move a window.</p></div></div>`;
    } else if (item.id === 'contact') {
      body.innerHTML = `<h1>Let's stay in touch.</h1><p>Find me around the internet, or send a hello.</p><div class="contact-links"><a href="mailto:sxie322@gatech.edu">Email · sxie322@gatech.edu ↗</a><a href="https://github.com/samxiexs">GitHub · samxiexs ↗</a><a href="https://www.linkedin.com/in/shenxie">LinkedIn · Shen Xie ↗</a><a href="cv-refernce/ShenXie-CV-202609.pdf">Open my CV (PDF) ↗</a><a href="misc.html">Photography, music & notes on the website ↗</a></div>`;
    } else if (item.id === 'credits') {
      body.innerHTML = `<h1>About this desktop</h1><p>A personal website inspired by Windows 98 and <a href="https://98.js.org/">98.js</a>. Desktop behavior and layout are implemented for this site.</p><h2>Wallpaper</h2><p>“Blue Sky with White Clouds” by <a href="https://www.pexels.com/photo/blue-sky-with-white-clouds-23234956/">Thilina Alagiyawanna / Pexels</a>. Used under the <a href="https://www.pexels.com/license/">Pexels License</a>, which allows free personal and commercial use. The photograph is hosted locally.</p><h2>Type & icons</h2><p>Pixelated MS Sans Serif by lou, distributed by <a href="https://jdan.github.io/98.css/">98.css</a>; <a href="assets/retro/fonts/font-LICENSE.txt">font license</a>. Classic icons sourced from 98.js; original visual assets belong to their respective owners. Attribution is not a separate license grant.</p><p><a href="assets/retro/SOURCES.md">Full asset sources and credits</a></p>`;
    } else if (item.id === 'misc') {
      body.innerHTML = `<h1>Misc</h1><p>Photos, music, and notes from the other side of the desk.</p><div class="text-links"><button type="button" data-open="photos">My Pictures</button><a href="misc.html#music">Music ↗</a></div><h2 style="margin:24px 0 14px">Notes</h2><div class="desktop-notes-list"></div>`;
      const list = body.querySelector('.desktop-notes-list');
      for (const note of window.personalCollections?.notes || []) {
        const card = document.createElement('article'); card.className = 'desktop-note-card';
        const date = document.createElement('time'); date.dateTime = note.date; date.textContent = note.date;
        const link = document.createElement(note.desktopApp ? 'button' : note.href ? 'a' : 'h3'); link.textContent = note.title;
        if (note.desktopApp) { link.type = 'button'; link.dataset.open = note.desktopApp; } else if (note.href) link.href = note.href;
        const summary = document.createElement('p'); summary.textContent = note.summary;
        card.append(date, link, summary); list.append(card);
      }
    } else if (item.id === 'cs-map') {
      item.map = window.CSMap.mount(body, { onSelect: id => { item.topic = id; updateExitLinks(item); } });
    } else if (item.id === 'photos') {
      body.innerHTML = '<h1>My Pictures</h1><p>Places and light, away from the desk.</p>';
      for (const album of window.personalCollections?.albums || []) {
        const section = document.createElement('section');
        const heading = document.createElement('h2'); heading.textContent = album.title;
        const note = document.createElement('p'); note.textContent = `${album.dates} · ${album.note}`;
        const grid = document.createElement('div'); grid.className = 'desktop-photo-grid';
        for (const photo of album.photos) {
          const link = document.createElement('a'); link.href = album.dir + photo.full; link.target = '_blank'; link.rel = 'noopener';
          const img = document.createElement('img'); img.src = album.dir + photo.src; img.alt = photo.alt; img.loading = 'lazy';
          const caption = document.createElement('span'); caption.textContent = photo.caption;
          link.append(img, caption); grid.append(link);
        }
        section.append(heading, note, grid); body.append(section);
      }
    }
  }
  function openApp(id) {
    if (!apps[id]) return;
    setMenu(false);
    if (state.has(id)) { focusWindow(state.get(id)); return; }
    const app = apps[id];
    const el = document.createElement('section'); el.className = `os-window app-${id}`; el.tabIndex = -1; el.setAttribute('role', 'region'); el.setAttribute('aria-label', `${app.title} window`);
    el.innerHTML = `<div class="os-titlebar"><span class="window-title">${icon(app.icon, 16)}<b>${app.title}</b></span><div class="window-controls"><button type="button" data-control="minimize" aria-label="Minimize ${app.title}">_</button><button type="button" data-control="maximize" aria-label="Maximize ${app.title}">□</button><button type="button" data-control="close" aria-label="Close ${app.title}">×</button></div></div><nav class="os-filebar" aria-label="Window shortcuts"><button data-open="welcome">Home</button><button data-open="research">Research</button><button data-open="photos">Pictures</button><button data-open="misc">Misc / Notes</button><button data-open="contact">Contact</button></nav><div class="os-address"><span>Address</span><span>My Computer / ${app.title}</span></div><div class="os-window-body"></div><div class="os-window-status"><span>${id === 'welcome' ? 'Welcome. Take a look around :)' : 'Shen Xie · Personal files'}</span><span>⌟</span></div>`;
    el.style.left = `${Math.min(150 + state.size * 30, Math.max(0, workspace.clientWidth - 740))}px`;
    el.style.top = `${24 + state.size * 24}px`;
    const task = document.createElement('button'); task.type = 'button'; task.className = 'task-button'; task.innerHTML = `${icon(app.icon, 16)}<span>${app.title}</span>`; task.setAttribute('aria-label', `Show or minimize ${app.title}`);
    const item = { id, app, el, task }; state.set(id, item); windows.append(el); tasks.append(task);
    task.onclick = () => { if (!el.hidden && el.classList.contains('active')) minimize(item); else focusWindow(item); };
    el.addEventListener('pointerdown', () => focusWindow(item, false));
    el.addEventListener('focusin', () => { if (!el.classList.contains('active')) focusWindow(item, false); });
    el.querySelector('[data-control="minimize"]').onclick = () => minimize(item);
    el.querySelector('[data-control="maximize"]').onclick = () => maximize(item);
    el.querySelector('[data-control="close"]').onclick = () => { minimize(item); state.delete(id); item.map?.destroy(); el.remove(); task.remove(); if (![...state.values()].some(w => !w.el.hidden)) (icons.querySelector(`[data-open="${id}"]`) || icons.querySelector('[data-open="misc"]')).focus(); announce(`${app.title} closed.`); };
    const titlebar = el.querySelector('.os-titlebar');
    titlebar.addEventListener('dblclick', event => { if (!event.target.closest('button')) maximize(item); });
    titlebar.addEventListener('pointerdown', event => {
      if (event.target.closest('button') || el.classList.contains('maximized') || matchMedia('(max-width: 640px)').matches) return;
      const x = event.clientX, y = event.clientY, left = el.offsetLeft, top = el.offsetTop;
      titlebar.setPointerCapture(event.pointerId);
      const move = e => { el.style.left = `${left + e.clientX - x}px`; el.style.top = `${top + e.clientY - y}px`; clamp(item); };
      const stop = () => { titlebar.removeEventListener('pointermove', move); titlebar.removeEventListener('pointerup', stop); titlebar.removeEventListener('pointercancel', stop); };
      titlebar.addEventListener('pointermove', move); titlebar.addEventListener('pointerup', stop); titlebar.addEventListener('pointercancel', stop);
    });
    for (const direction of ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw']) {
      const handle = document.createElement('div');
      handle.className = `resize-handle resize-${direction}`;
      handle.setAttribute('aria-hidden', 'true');
      el.append(handle);
      handle.addEventListener('pointerdown', event => {
        if (event.button !== 0 || el.classList.contains('maximized') || matchMedia('(max-width:640px)').matches) return;
        event.preventDefault(); event.stopPropagation(); focusWindow(item, false);
        const x = event.clientX, y = event.clientY;
        const left = el.offsetLeft, top = el.offsetTop, width = el.offsetWidth, height = el.offsetHeight;
        const right = left + width, bottom = top + height;
        handle.setPointerCapture(event.pointerId);
        const move = e => {
          const dx = e.clientX - x, dy = e.clientY - y;
          let l = left, t = top, r = right, b = bottom;
          if (direction.includes('e')) r = Math.max(left + 320, Math.min(workspace.clientWidth, right + dx));
          if (direction.includes('s')) b = Math.max(top + 240, Math.min(workspace.clientHeight, bottom + dy));
          if (direction.includes('w')) l = Math.max(0, Math.min(right - 320, left + dx));
          if (direction.includes('n')) t = Math.max(0, Math.min(bottom - 240, top + dy));
          Object.assign(el.style, { left: `${l}px`, top: `${t}px`, width: `${r-l}px`, height: `${b-t}px` });
        };
        const stop = () => { handle.removeEventListener('pointermove', move); handle.removeEventListener('pointerup', stop); handle.removeEventListener('pointercancel', stop); };
        handle.addEventListener('pointermove', move); handle.addEventListener('pointerup', stop); handle.addEventListener('pointercancel', stop);
      });
    }
    fill(item); clamp(item); focusWindow(item); announce(`${app.title} opened.`);
  }
  for (const [id, app] of Object.entries(apps)) {
    const button = document.createElement('button'); button.type = 'button'; button.dataset.open = id; button.className = 'desktop-icon'; button.innerHTML = `${icon(app.icon)}<span>${app.label || app.title}</span>`; if (!app.hideDesktopIcon) icons.append(button);
    const entry = button.cloneNode(true); entry.className = 'start-app'; document.querySelector('#start-apps').append(entry);
  }
  document.addEventListener('click', event => {
    const app = event.target.closest('[data-open]'); if (app) openApp(app.dataset.open);
    const exit = event.target.closest('[data-exit]');
    if (exit) { try { const old = JSON.parse(localStorage.getItem('shen-site-appearance')) || {}; localStorage.setItem('shen-site-appearance', JSON.stringify({ ...old, mode: exit.dataset.exit })); } catch {} }
    if (!menu.contains(event.target) && !start.contains(event.target) && !menu.hidden) setMenu(false);
  });
  start.onclick = () => { setMenu(menu.hidden); if (!menu.hidden) menu.querySelector('button').focus(); };
  document.querySelector('#show-desktop').onclick = () => { state.forEach(item => { item.el.hidden = true; item.task.setAttribute('aria-pressed', 'false'); }); setMenu(false); icons.querySelector('button').focus(); };
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !menu.hidden) { setMenu(false); start.focus(); } });
  window.addEventListener('resize', () => state.forEach(clamp));
  const clock = () => { const now = new Date(); const time = document.querySelector('#desktop-clock'); time.textContent = new Intl.DateTimeFormat('en-US', {hour:'numeric',minute:'2-digit',timeZone:'America/New_York'}).format(now); time.dateTime = now.toISOString(); time.title = 'Atlanta, Georgia'; };
  clock(); setInterval(clock, 30000);
  const boot = document.querySelector('#boot-screen');
  let bootTimer;
  function finishBoot() {
    clearTimeout(bootTimer);
    if (boot.open) boot.close();
    try { sessionStorage.setItem('shen-desktop-booted', '1'); } catch {}
    const active = [...state.values()].find(w => w.el.classList.contains('active') && !w.el.hidden);
    if (active) focusWindow(active);
  }
  function bootDesktop() {
    setMenu(false);
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { finishBoot(); return; }
    boot.showModal();
    document.querySelector('#skip-boot').focus();
    bootTimer = setTimeout(finishBoot, 2200);
  }
  document.querySelector('#skip-boot').onclick = finishBoot;
  boot.addEventListener('cancel', event => { event.preventDefault(); finishBoot(); });
  document.querySelector('#restart-desktop').onclick = () => {
    state.forEach(item => { item.map?.destroy(); item.el.remove(); item.task.remove(); });
    state.clear();
    openApp('welcome');
    bootDesktop();
  };
  openApp('welcome');
  if (apps[location.hash.slice(1)]) openApp(location.hash.slice(1));
  let alreadyBooted = false;
  try { alreadyBooted = sessionStorage.getItem('shen-desktop-booted') === '1'; } catch {}
  if (!alreadyBooted) bootDesktop();
})();
