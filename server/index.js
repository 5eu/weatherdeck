const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files in production
app.use(express.static(path.join(__dirname, '..', 'dist')));

// ── Preset cities ──────────────────────────────────────────
const CITIES = [
  { id: 1, name: 'Montreal',  displayName: 'MONTREAL',  lat: 45.5017, lon: -73.5673, tz: 'America/Toronto' },
  { id: 2, name: 'Toronto',   displayName: 'TORONTO',   lat: 43.6532, lon: -79.3832, tz: 'America/Toronto' },
  { id: 3, name: 'Vancouver', displayName: 'VANCOUVER', lat: 49.2827, lon: -123.1207, tz: 'America/Vancouver' },
  { id: 4, name: 'Tokyo',     displayName: 'TOKYO',     lat: 35.6762, lon: 139.6503, tz: 'Asia/Tokyo' },
  { id: 5, name: 'New York',  displayName: 'NEW YORK',  lat: 40.7128, lon: -74.0060, tz: 'America/New_York' },
  { id: 6, name: 'London',    displayName: 'LONDON',    lat: 51.5074, lon: -0.1278, tz: 'Europe/London' },
  { id: 7, name: 'Beijing',   displayName: 'BEIJING',   lat: 39.9042, lon: 116.4074, tz: 'Asia/Shanghai' },
  { id: 8, name: 'Paris',     displayName: 'PARIS',     lat: 48.8566, lon: 2.3522, tz: 'Europe/Paris' },
];

// ── Weather cache (10 min TTL) ─────────────────────────────
const weatherCache = new Map();
const CACHE_TTL = 10 * 60 * 1000;

function getCacheKey(lat, lon) {
  return `${lat.toFixed(2)},${lon.toFixed(2)}`;
}

// ── WMO weather codes ──────────────────────────────────────
const weatherCodeMap = {
  0:  { label: 'CLEAR',          bg: 'sunny' },
  1:  { label: 'MAINLY CLEAR',   bg: 'sunny' },
  2:  { label: 'PARTLY CLOUDY',  bg: 'cloudy' },
  3:  { label: 'OVERCAST',       bg: 'cloudy' },
  45: { label: 'FOG',            bg: 'cloudy' },
  48: { label: 'RIME FOG',       bg: 'cloudy' },
  51: { label: 'LIGHT DRIZZLE',  bg: 'rain' },
  53: { label: 'DRIZZLE',        bg: 'rain' },
  55: { label: 'HEAVY DRIZZLE',  bg: 'rain' },
  61: { label: 'LIGHT RAIN',     bg: 'rain' },
  63: { label: 'RAIN',           bg: 'rain' },
  65: { label: 'HEAVY RAIN',     bg: 'rain' },
  71: { label: 'LIGHT SNOW',     bg: 'snow' },
  73: { label: 'SNOW',           bg: 'snow' },
  75: { label: 'HEAVY SNOW',     bg: 'snow' },
  77: { label: 'SNOW GRAINS',    bg: 'snow' },
  80: { label: 'RAIN SHOWERS',   bg: 'rain' },
  81: { label: 'RAIN SHOWERS',   bg: 'rain' },
  82: { label: 'HEAVY SHOWERS',  bg: 'rain' },
  85: { label: 'SNOW SHOWERS',   bg: 'snow' },
  86: { label: 'HEAVY SNOW',     bg: 'snow' },
  95: { label: 'THUNDERSTORM',   bg: 'storm' },
  96: { label: 'THUNDERSTORM',   bg: 'storm' },
  99: { label: 'SEVERE STORM',   bg: 'storm' },
};

// ── Routes ─────────────────────────────────────────────────
app.get('/api/cities', (req, res) => {
  res.json(CITIES);
});

app.get('/api/weather', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) return res.status(400).json({ error: 'lat and lon required' });

    const key = getCacheKey(parseFloat(lat), parseFloat(lon));
    const cached = weatherCache.get(key);
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
      return res.json({ ...cached.data, cached: true });
    }

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code,cloud_cover&wind_speed_unit=kmh&temperature_unit=celsius`;
    
    const response = await fetch(url);
    const raw = await response.json();

    if (!raw.current) {
      return res.status(502).json({ error: 'Open-Meteo returned no data' });
    }

    const c = raw.current;
    const code = c.weather_code;
    const weatherInfo = weatherCodeMap[code] || { label: 'UNKNOWN', bg: 'cloudy' };

    const data = {
      temperature: Math.round(c.temperature_2m),
      humidity: c.relative_humidity_2m,
      apparentTemp: Math.round(c.apparent_temperature),
      windSpeed: Math.round(c.wind_speed_10m),
      cloudCover: c.cloud_cover,
      weatherCode: code,
      weatherLabel: weatherInfo.label,
      weatherBg: weatherInfo.bg,
      fetchedAt: new Date().toISOString(),
    };

    weatherCache.set(key, { data, fetchedAt: Date.now() });
    res.json(data);
  } catch (err) {
    console.error('Weather fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch weather' });
  }
});

// ── Start ──────────────────────────────────────────────────
// SPA fallback — serve index.html for non-API routes
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`WeatherDeck running on :${PORT}`);
});
