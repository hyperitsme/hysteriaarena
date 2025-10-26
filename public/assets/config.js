
// HysteriaArena data config
// Set DEMO_MODE=false and fill API_BASE / WS_URL to wire real data.
// Auth header example: { 'Authorization': 'Bearer <token>' }
window.HA_CONFIG = {
  DEMO_MODE: true,
  API_BASE: "https://hysteriaarena.onrender.com",   // e.g., https://api.hysteriaarena.com
  WS_URL: "wss://hysteriaarena.onrender.com/ws",
  POLL_MS: 8000,
  HEADERS: {},
  // Expected payloads:
  // GET /live/summary -> { agents:[{id:'gpt5', bankroll:2.95, win:0.60, slip:13.6, pct:1.23}], prices:{BTC:...,ETH:...,SOL:...,BNB:...} }
  // GET /live/series?range=ALL -> { series:{ gpt5:[{t:..., v:...}, ...], claude:[...], deepseek:[...], grok:[...] } }
  // WS message -> { type:'trade'|'chat'|'position', payload:{...} }
};
