/* gallery.js — renders the photo and music collections from collections.js,
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
    for (const photo of collections.photos || []) {
      const src = safeUrl(photo.src);
      if (!src || !photo.alt) continue;
      const figure = document.createElement('figure');
      const link = document.createElement('a');
      link.href = src;
      link.setAttribute('aria-label', `View full photo: ${photo.alt}`);
      const image = document.createElement('img');
      image.src = src; image.alt = photo.alt; image.loading = 'lazy';
      link.append(image); figure.append(link);
      if (photo.caption) figure.append(text('figcaption', photo.caption));
      photos.append(figure);
      const index = shown.push({ src, alt: photo.alt, caption: photo.caption || '' }) - 1;
      link.addEventListener('click', (event) => { if (openLightbox(index)) event.preventDefault(); });
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
})();
