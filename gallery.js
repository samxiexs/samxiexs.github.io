/* gallery.js — renders the photo, music, and notes collections from collections.js,
   and opens photos in a keyboard-navigable lightbox (native <dialog>). */
(() => {
  const collections = window.personalCollections || {};
  const safeUrl = (value) => {
    if (typeof value !== 'string' || !value.trim()) return null;
    try {
      const url = new URL(value, document.baseURI);
      return ['http:', 'https:'].includes(url.protocol) || (url.protocol === 'file:' && location.protocol === 'file:') ? url.href : null;
    } catch { return null; }
  };
  const text = (tag, value) => { const element = document.createElement(tag); element.textContent = value || ''; return element; };

  const photos = document.getElementById('photos');
  if (photos) {
    const shown = [];
    const addPhoto = (grid, photo, base) => {
      const src = safeUrl(base + photo.src);
      if (!src || !photo.alt) return;
      const full = safeUrl(base + (photo.full || photo.src)) || src;
      const figure = document.createElement('figure');
      const link = document.createElement('a');
      link.href = full;
      link.setAttribute('aria-label', `View full photo: ${photo.alt}`);
      const image = document.createElement('img');
      image.src = src; image.alt = photo.alt; image.loading = 'lazy'; image.decoding = 'async';
      if (photo.w && photo.h) { image.width = photo.w; image.height = photo.h; }
      link.append(image); figure.append(link);
      if (photo.caption) figure.append(text('figcaption', photo.caption));
      grid.append(figure);
      const index = shown.push({ src: full, alt: photo.alt, caption: photo.caption || '' }) - 1;
      link.addEventListener('click', (event) => { if (openLightbox(index)) event.preventDefault(); });
    };
    // Albums are collapsible. Closed: title + a floating stack of a few photos that fans out on
    // hover and drifts with the cursor. Clicking the title (or the stack) opens the full grid;
    // the title or the "Close album" button at the bottom closes it again.
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    for (const album of collections.albums || []) {
      const base = album.dir || '';
      const grid = document.createElement('div');
      grid.className = 'album-grid';
      for (const photo of album.photos || []) addPhoto(grid, photo, base);
      if (!grid.childElementCount) continue;

      const details = document.createElement('details');
      details.className = 'album';
      if (album.id) details.id = album.id;
      const summary = document.createElement('summary');
      summary.append(text('h3', album.title));
      const meta = [album.dates, `${grid.childElementCount} photos`].filter(Boolean).join(' · ');
      const dates = text('span', meta); dates.className = 'album-dates'; summary.append(dates);
      if (album.note) { const n = text('span', album.note); n.className = 'album-note'; summary.append(n); }

      // Floating preview: up to five cards, centred card on top.
      const preview = document.createElement('span');
      preview.className = 'album-preview';
      preview.setAttribute('aria-hidden', 'true');
      const picks = (album.preview || [0, 1, 2, 3, 4]).map((i) => album.photos[i]).filter(Boolean).slice(0, 5);
      const mid = (picks.length - 1) / 2;
      picks.forEach((photo, k) => {
        const src = safeUrl(base + photo.src);
        if (!src) return;
        const card = document.createElement('span');
        card.className = 'album-card';
        const i = k - mid;
        card.style.setProperty('--i', i);
        card.style.setProperty('--d', `${10 + Math.abs(i) * 8}px`);
        card.style.zIndex = String(10 - Math.round(Math.abs(i) * 2));
        const img = document.createElement('img');
        img.src = src; img.alt = ''; img.loading = 'lazy'; img.decoding = 'async';
        card.append(img);
        preview.append(card);
      });
      if (!reduced) {
        preview.addEventListener('pointermove', (e) => {
          const r = preview.getBoundingClientRect();
          preview.style.setProperty('--mx', ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
          preview.style.setProperty('--my', ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
        });
        preview.addEventListener('pointerleave', () => { preview.style.setProperty('--mx', 0); preview.style.setProperty('--my', 0); });
      }
      summary.append(preview);

      const body = document.createElement('div');
      body.className = 'album-body';
      const close = document.createElement('button');
      close.type = 'button';
      close.className = 'album-close';
      close.textContent = 'Close album ↑';
      close.addEventListener('click', () => {
        details.open = false;
        summary.scrollIntoView({ block: 'start', behavior: reduced ? 'auto' : 'smooth' });
        summary.focus({ preventScroll: true });
      });
      body.append(grid, close);
      details.append(summary, body);
      photos.append(details);
    }
    // Loose photos (no album) still work.
    if ((collections.photos || []).length) {
      const grid = document.createElement('div');
      grid.className = 'album-grid';
      for (const photo of collections.photos) addPhoto(grid, photo, '');
      if (grid.childElementCount) photos.append(grid);
    }
    document.getElementById('photo-empty').hidden = photos.childElementCount > 0;

    // Lightbox: ← → to move, Esc or a click outside the photo to close.
    let dialog, current = 0;
    function build() {
      dialog = document.createElement('dialog');
      dialog.className = 'lightbox';
      dialog.setAttribute('aria-label', 'Photo viewer');
      dialog.innerHTML = '<figure><img alt=""><figcaption></figcaption></figure><button type="button" class="prev" aria-label="Previous photo">←</button><button type="button" class="next" aria-label="Next photo">→</button><button type="button" class="close" aria-label="Close">×</button>';
      document.body.append(dialog);
      dialog.querySelector('.prev').addEventListener('click', () => show(current - 1));
      dialog.querySelector('.next').addEventListener('click', () => show(current + 1));
      dialog.querySelector('.close').addEventListener('click', () => dialog.close());
      dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
      dialog.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowLeft') show(current - 1);
        if (event.key === 'ArrowRight') show(current + 1);
      });
    }
    function show(index) {
      current = (index + shown.length) % shown.length;
      const item = shown[current];
      const image = dialog.querySelector('img');
      image.src = item.src; image.alt = item.alt;
      dialog.querySelector('figcaption').textContent = item.caption;
      dialog.querySelector('figcaption').hidden = !item.caption;
      const single = shown.length < 2;
      dialog.querySelector('.prev').hidden = single;
      dialog.querySelector('.next').hidden = single;
    }
    function openLightbox(index) {
      if (typeof HTMLDialogElement === 'undefined') return false;
      if (!dialog) build();
      show(index);
      dialog.showModal();
      return true;
    }
  }

  const tracks = document.getElementById('tracks');
  if (tracks) {
    for (const track of collections.music || []) {
      const src = safeUrl(track.src), url = safeUrl(track.url);
      if (!track.title || (!src && !url)) continue;
      const article = document.createElement('article'); article.className = 'track';
      article.append(text('h2', track.title));
      if (track.artist) article.append(text('p', track.artist));
      if (track.note) article.append(text('p', track.note));
      if (src) {
        const audio = document.createElement('audio'); audio.controls = true; audio.preload = 'none'; audio.src = src;
        audio.setAttribute('aria-label', `Play ${track.title}`);
        article.append(audio);
      }
      if (url) { const link = text('a', 'Listen ↗'); link.href = url; article.append(link); }
      tracks.append(article);
    }
    document.getElementById('music-empty').hidden = tracks.childElementCount > 0;
  }

  const notes = document.getElementById('notes-list');
  if (notes) {
    for (const note of collections.notes || []) {
      if (!note.title) continue;
      const href = safeUrl(note.href);
      const article = document.createElement('article'); article.className = 'note';
      const time = document.createElement('time');
      if (note.date) { time.dateTime = note.date; time.textContent = note.date; }
      const title = document.createElement('h3');
      if (href) { const link = text('a', note.title); link.href = href; title.append(link); } else title.textContent = note.title;
      const body = document.createElement('div');
      body.append(title);
      if (note.summary) body.append(text('p', note.summary));
      article.append(time, body);
      notes.append(article);
    }
    document.getElementById('notes-empty').hidden = notes.childElementCount > 0;
  }
})();
