// server.js
import express from 'express';
import cors from 'cors';
import http from 'http';
import { WebSocketServer } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';

import { state } from './state.js';
import { startEngine, toSummaryArray, seriesPayload } from './engine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Jika kamu host web & API di domain yang sama, CORS sebenarnya tak diperlukan,
// tapi kita tetap izinkan untuk jaga-jaga preview dll.
app.use(cors({ origin: true }));

// Static files
const PUB = path.join(__dirname, 'public');
app.use(express.static(PUB, { maxAge: '5m', index: false }));

// --- API (same-origin): /live/summary dan /live/series
app.get('/healthz', (_, res) => res.send('ok'));

app.get('/live/summary', (_, res) => {
  res.json({ ok: true, agents: toSummaryArray(), prices: state.prices, ts: Date.now() });
});

app.get('/live/series', (req, res) => {
  res.json({ ok: true, series: seriesPayload(), ts: Date.now() });
});

// Route untuk file HTML (multi-page)
app.get('/', (_, res) => res.sendFile(path.join(PUB, 'index.html')));
app.get('/live.html', (_, res) => res.sendFile(path.join(PUB, 'live.html')));
app.get('/matrix.html', (_, res) => res.sendFile(path.join(PUB, 'matrix.html')));
app.get('/rules.html', (_, res) => res.sendFile(path.join(PUB, 'rules.html')));

// HTTP server + WS
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

// broadcast helper
function broadcast(msg) {
  const data = JSON.stringify(msg);
  wss.clients.forEach(c => c.readyState === 1 && c.send(data));
}

wss.on('connection', (ws) => {
  // snapshot awal
  ws.send(JSON.stringify({ type: 'summary', payload: { agents: toSummaryArray() } }));
  ws.send(JSON.stringify({ type: 'bootstrap', payload: {
    trades: state.trades.slice(-10),
    chat: state.chat.slice(-10),
    series: seriesPayload()
  }}));
  // heartbeat agar koneksi tetap hidup
  const ping = setInterval(() => { try { ws.ping(); } catch(_) {} }, 25000);
  ws.on('close', () => clearInterval(ping));
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log('HysteriaArena running on :' + PORT));

// jalankan mesin realtime
startEngine(broadcast);
