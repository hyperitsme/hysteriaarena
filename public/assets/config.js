window.HA_CONFIG = {
  DEMO_MODE: false,                                     // real-time (bukan demo)
  API_BASE: "",                                         // kosong = pakai origin yang sama
  WS_URL: (location.origin.replace(/^http/, "ws") + "/ws"),
  POLL_MS: 8000,
  HEADERS: {}
};
