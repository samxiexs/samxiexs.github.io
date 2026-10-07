/* weather.js — live conditions in Atlanta for the strip at the top of the page,
   e.g. "72°F · partly cloudy · wind 6 mph ↗". Data: Open-Meteo (free, no key, CORS-enabled),
   cached for 10 minutes per tab. The wind is also published as window.siteWind so field.js can
   let the background streamlines drift with the real wind. If the request fails, the weather part
   simply stays hidden and the clock still shows. */
(() => {
  const slot = document.querySelector('[data-weather]');
  if (!slot || typeof fetch !== 'function') return;
  const URL = 'https://api.open-meteo.com/v1/forecast?latitude=33.7756&longitude=-84.3963'
    + '&current=temperature_2m,wind_speed_10m,wind_direction_10m,cloud_cover,weather_code,is_day'
    + '&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=America%2FNew_York';
  const KEY = 'shen-site-weather';
  const TTL = 10 * 60 * 1000;

  // WMO weather codes → a few plain words.
  const sky = (code, clouds) => {
    if (code >= 95) return 'thunderstorms';
    if (code >= 85) return 'snow showers';
    if (code >= 80) return 'showers';
    if (code >= 71) return 'snow';
    if (code >= 61) return 'rain';
    if (code >= 51) return 'drizzle';
    if (code >= 45) return 'fog';
    if (code === 3 || clouds > 85) return 'overcast';
    if (code === 2 || clouds > 40) return 'partly cloudy';
    if (code === 1) return 'mostly clear';
    return 'clear';
  };
  // Meteorological direction says where the wind comes FROM; the arrow points where it goes.
  const compass = (deg) => ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.round(deg / 45) % 8];

  function render(c) {
    const toward = (c.wind_direction_10m + 180) % 360;
    const mph = Math.round(c.wind_speed_10m);
    slot.replaceChildren();
    const add = (cls, txt) => { const s = document.createElement('span'); if (cls) s.className = cls; s.textContent = txt; slot.append(s); return s; };
    add('', `${Math.round(c.temperature_2m)}°F`);
    add('', sky(c.weather_code, c.cloud_cover));
    const wind = add('wx-wind', `wind ${mph} mph `);
    const arrow = document.createElement('span');
    arrow.className = 'wx-arrow';
    arrow.textContent = '↑';
    arrow.style.setProperty('--toward', `${toward}deg`);
    arrow.title = `from the ${compass(c.wind_direction_10m)}`;
    wind.append(arrow);
    slot.hidden = false;
    window.siteWind = { mph, toward };
    window.dispatchEvent(new CustomEvent('sitewind', { detail: window.siteWind }));
  }

  try {
    const cached = JSON.parse(sessionStorage.getItem(KEY));
    if (cached && Date.now() - cached.at < TTL) { render(cached.current); return; }
  } catch {}

  const ctrl = new AbortController();
  setTimeout(() => ctrl.abort(), 6000);
  fetch(URL, { signal: ctrl.signal })
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    .then((d) => {
      if (!d.current || typeof d.current.temperature_2m !== 'number') return;
      render(d.current);
      try { sessionStorage.setItem(KEY, JSON.stringify({ at: Date.now(), current: d.current })); } catch {}
    })
    .catch(() => { /* offline or blocked: keep the weather hidden */ });
})();
