// server.js
import express from 'express';
import cors from 'cors';
import http from 'http';
import { WebSocketServer } from 'ws';
import { state } from './state.js';
import { startEngine, toSummaryArray, seriesPayload } from './engine.js';

const app = express();

// ---- CORS: izinkan domain kamu & render subdomain
const ORIGINS = [
  'https://hysteriaarena.site',
  'https://www.hysteriaarena.site',
  // fallback saat preview / testing:
  'https://hysteriaarena.onrender.com',
  'http://localhost:5173',
  'http://localhost:8080'
];
app.use(cors({ origin: (o, cb)=> cb(null, !o || ORIGINS.includes(o)), methods: ['GET'] }));

app.get('/healthz', (_,res)=> res.send('ok'));

app.get('/live/summary', (_, res) => {
  res.json({ ok:true, agents: toSummaryArray(), prices: state.prices, ts: Date.now() });
});

app.get('/live/series', (req, res) => {
  // range param bisa dipakai kalau nanti pecah ALL/24H
  res.json({ ok:true, series: seriesPayload(), ts: Date.now() });
});

app.get('/', (_,res)=> res.json({ ok:true, service:'hysteriaarena-api' }));

const server = http.createServer(app);

// ---- WebSocket
const wss = new WebSocketServer({ server, path: '/ws' });
function broadcast(msg){
  const data = JSON.stringify(msg);
  wss.clients.forEach(c => c.readyState === 1 && c.send(data));
}
wss.on('connection', (ws) => {
  // kirim snapshot saat connect
  ws.send(JSON.stringify({ type:'summary', payload:{ agents: toSummaryArray() }}));
  ws.send(JSON.stringify({ type:'bootstrap', payload:{
    trades: state.trades.slice(-10),
    chat: state.chat.slice(-10),
    series: seriesPayload()
  }}));
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log('API listening on :' + PORT);
});

// start engine
startEngine(broadcast);
