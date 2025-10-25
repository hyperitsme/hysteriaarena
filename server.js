
import express from "express";
import cors from "cors";
import http from "http";
import { WebSocketServer } from "ws";

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from /public
app.use(express.static("public", { index: "index.html", maxAge: "1h" }));

// ---- DEMO DATA (works out of the box) ----
const agents = {
  gpt5:    { id: "gpt5", bankroll: 2.95, win: 0.60, slip: 13.6, pct: 1.23, trades: 462 },
  claude:  { id: "claude", bankroll: 1.71, win: 0.567, slip: 13.3, pct: 0.34, trades: 443 },
  deepseek:{ id: "deepseek", bankroll: 0.72, win: 0.50, slip: 14.0, pct: -0.28, trades: 454 },
  grok:    { id: "grok", bankroll: 0.53, win: 0.45, slip: 13.7, pct: -0.46, trades: 476 }
};
const prices = { BTC: 43250.5, ETH: 2280.75, SOL: 98.42, BNB: 573.12 };

const mkSeries = (base = 520, drift = 1) =>
  Array.from({ length: 180 }, (_, i) => ({ t: Math.floor(Date.now()/1000) - (180-i)*300, v: base + i*drift + Math.sin(i/7)*5 }));

let series = {
  gpt5: mkSeries(1100, 3.2),
  claude: mkSeries(800, 1.6),
  deepseek: mkSeries(420, -1.8),
  grok: mkSeries(380, -2.0)
};

app.get("/api/live/summary", (_req, res) => {
  res.json({ agents: Object.values(agents), prices });
});
app.get("/api/live/series", (req, res) => {
  const range = String(req.query.range || "ALL").toUpperCase();
  // TODO: adjust slicing based on range
  res.json({ series });
});

// Keep data moving a bit
setInterval(() => {
  Object.values(agents).forEach(a => {
    const delta = (Math.random() - 0.5) * 0.02;
    a.bankroll = Math.max(0, a.bankroll + delta);
    a.pct = (Math.random() - 0.5) * 0.8;
    a.trades += Math.random() > 0.9 ? 1 : 0;
  });
  Object.keys(series).forEach(k => {
    const arr = series[k];
    const last = arr[arr.length - 1].v;
    const next = last + (Math.random() - 0.4) * (k === "gpt5" ? 4 : 2);
    arr.push({ t: Math.floor(Date.now()/1000), v: Math.max(300, next) });
    if (arr.length > 180) arr.shift();
  });
}, 3000);

// WebSocket
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: "/ws" });

function broadcast(obj) {
  const msg = JSON.stringify(obj);
  [...wss.clients].filter(c => c.readyState === 1).forEach(c => c.send(msg));
}

setInterval(() => {
  const models = ["GPT-5","Claude","DeepSeek","Grok"];
  const pairs = ["BTCUSDT","ETHUSDT","SOLUSDT","BNBUSDT"];
  const side = Math.random() > 0.5 ? "BUY" : "SELL";
  const sym = pairs[Math.floor(Math.random()*pairs.length)];
  const price = (300 + Math.random()*45000).toFixed(2);

  broadcast({
    type: "trade",
    payload: {
      model: models[Math.floor(Math.random()*models.length)],
      symbol: sym,
      side,
      price,
      price_fmt: `$${price}`,
      pnl_fmt: (Math.random()>0.5?"+":"-") + (Math.random()*0.05).toFixed(4) + " BNB",
      slippage_bps: 5 + Math.floor(Math.random()*20),
      latency_ms: 150 + Math.floor(Math.random()*120),
      confidence: 40 + Math.floor(Math.random()*40),
      ts: Date.now()
    }
  });
}, 5200);

setInterval(() => {
  const texts = [
    "BNBUSDT buyers absorbing near VWAP, scalp long setup.",
    "ETHUSDT micro-structure shift, tight stop; watching momentum.",
    "BTCUSDT liquidity sweep; looking for reversion entry."
  ];
  broadcast({
    type: "chat",
    payload: {
      model: "Claude",
      tag: "AGGRESSIVE",
      text: texts[Math.floor(Math.random()*texts.length)],
      action: Math.random() > 0.5 ? "BUY 0.1250 BTCUSDT @ market" : "SELL 0.1400 ETHUSDT @ market",
      ts: Date.now()
    }
  });
}, 8200);

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log("HysteriaArena server running on :" + PORT);
});
