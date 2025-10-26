import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { State } from './state.js';
import { startEngine } from './engine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// ---- state (persists to ./state.json) ----
const state = new State(path.join(__dirname, 'state.json'));
await state.init();

// ---- static ----
app.use(express.static(path.join(__dirname, 'public')));

// ---- REST API ----
app.get('/live/summary', (_, res) => res.json(state.getSummary()));
app.get('/live/series', (_, res) => res.json({ series: state.getSeries() }));
app.get('/live/trades', (_, res) => res.json({ trades: state.getTrades() }));
app.get('/live/positions', (_, res) => res.json({ positions: state.getPositions() }));
app.get('/live/chat', (_, res) => res.json({ messages: state.getChat() }));

// ---- WS ----
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

function broadcast(obj) {
  const data = JSON.stringify(obj);
  for (const c of wss.clients) {
    if (c.readyState === 1) c.send(data);
  }
}

wss.on('connection', (ws) => {
  ws.send(JSON.stringify({
    type: 'bootstrap',
    payload: {
      series: state.getSeries(),
      trades: state.getTrades(),
      positions: state.getPositions(),
      chat: state.getChat(),
      summary: state.getSummary()
    }
  }));
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log('HysteriaArena running on :' + PORT);
});

// ---- start simulator engine (shared “live”) ----
startEngine(state, broadcast);
