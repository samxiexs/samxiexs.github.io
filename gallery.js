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
    }
    document.getElementById('photo-empty').hidden = photos.childElementCount > 0;
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
