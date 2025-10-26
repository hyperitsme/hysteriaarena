// CONFIG — realtime mode (semua user lihat data yang sama)
window.HA_CONFIG = {
  DEMO_MODE: false,     // set true hanya jika mau mock lokal
  API_BASE: "",         // same-origin (ngikut domain saat ini)
  WS_URL: "/ws",        // path WebSocket di server.js
  POLL_MS: 8000         // interval polling fallback
};
