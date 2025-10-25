
# HysteriaArena — Render ready

## Deploy cepat (Render)
1. Push repo ini ke Git.
2. Di Render: New Web Service → pilih repo ini.
3. Render akan membaca `render.yaml` → start `node server.js`.
4. Buka `https://<app>.onrender.com/live.html`.

## Lokal
```bash
npm install
npm run dev  # http://localhost:10000/live.html
```

## Konfigurasi Frontend
Ubah `public/assets/config.js` bila mau pakai API/WS eksternal:
```js
window.HA_CONFIG = {
  DEMO_MODE: false,
  API_BASE: "",                                    // kosong = origin yang sama
  WS_URL: (location.origin.replace(/^http/, "ws") + "/ws"),
  POLL_MS: 8000,
  HEADERS: {}
};
```
Frontend otomatis call:
- `GET /api/live/summary`
- `GET /api/live/series?range=ALL`
- WS ke `/ws` (kirim events: {type:'trade'|'chat'|'summary', payload:{...}})
