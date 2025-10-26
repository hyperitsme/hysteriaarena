// engine.js
import { state, MODELS, cap } from './state.js';

const SYMS = ['BTCUSDT','ETHUSDT','SOLUSDT','BNBUSDT'];

export function startEngine(broadcast) {
  // update chart & summary tiap 3s
  setInterval(() => {
    MODELS.forEach(m => {
      const last = state.series[m.id][state.series[m.id].length - 1]?.v ?? 800;
      const delta =
        m.id === 'gpt5'     ?  (3.0 + (Math.random()-0.5)*6) :
        m.id === 'claude'   ?  (1.6 + (Math.random()-0.5)*4) :
        m.id === 'deepseek' ?  (-2.6 + (Math.random()-0.5)*4) :
                               (-3.0 + (Math.random()-0.5)*3);

      const next = Math.max(250, last + delta);
      state.series[m.id].push({ t: Date.now(), v: next });
      cap(state.series[m.id], 240);

      // update summary bankroll roughly related
      const a = state.agents[m.id];
      a.bankroll = Math.max(0, a.bankroll + (Math.random()-0.5)*0.01);
      a.pct = +(a.pct + (Math.random()-0.5)*1.2).toFixed(2);
      a.trades += (Math.random() < 0.35 ? 1 : 0);
      a.win = Math.min(0.8, Math.max(0.2, a.win + (Math.random()-0.5)*0.01));
      a.slip = +(a.slip + (Math.random()-0.5)*0.2).toFixed(1);
    });

    broadcast({ type: 'summary', payload: { agents: toSummaryArray() } });
  }, 3000);

  // spawn trade tiap 5–7s
  setInterval(() => {
    const model = randomOf(MODELS).name;
    const symbol = randomOf(SYMS);
    const side = Math.random() > 0.5 ? 'BUY' : 'SELL';
    const price = priceFor(symbol);
    const slip = 8 + (Math.random()*20|0);
    const lat  = 160 + (Math.random()*120|0);
    const conf = 45 + (Math.random()*35|0);
    const trade = {
      ts: Date.now(), model, side, symbol,
      price, price_fmt: `$${price.toLocaleString()}`,
      slippage_bps: slip, latency_ms: lat, confidence: conf,
      pnl_fmt: Math.random()>0.5 ? `+${(Math.random()*0.05).toFixed(4)} BNB` : `-${(Math.random()*0.05).toFixed(4)} BNB`
    };
    state.trades.push(trade); cap(state.trades, 200);
    broadcast({ type: 'trade', payload: trade });
  }, 5200);

  // spawn chat tiap 8–12s
  setInterval(() => {
    const m = randomOf(MODELS);
    const symbol = randomOf(SYMS);
    const txt = `${symbol} micro-structure ${Math.random()>0.5?'shift':'stability'} detected. ${Math.random()>0.5?'Buyers':'Sellers'} ${Math.random()>0.5?'absorbing':'thinning'} near VWAP.`;
    const note = {
      ts: Date.now(),
      model: m.name,
      tag: m.temperament,
      text: txt,
      action: `${Math.random()>0.5?'BUY':'SELL'} ${(0.05 + Math.random()*0.3).toFixed(4)} ${symbol} @ market`
    };
    state.chat.push(note); cap(state.chat, 200);
    broadcast({ type: 'chat', payload: note });
  }, 9000);
}

function randomOf(arr){ return arr[Math.random()*arr.length|0]; }
function priceFor(sym){
  if (sym==='BTCUSDT') return Math.round(42000 + Math.random()*2000);
  if (sym==='ETHUSDT') return +(2200 + Math.random()*120).toFixed(2);
  if (sym==='SOLUSDT') return +(90 + Math.random()*20).toFixed(2);
  return +(560 + Math.random()*30).toFixed(2); // BNB
}

export function toSummaryArray() {
  return Object.entries(state.agents).map(([id, a]) => ({
    id, bankroll: +a.bankroll.toFixed(4), pct: +a.pct,
    trades: a.trades, win: +a.win, slip: +a.slip
  }));
}

export function seriesPayload() {
  return {
    gpt5:     state.series.gpt5,
    claude:   state.series.claude,
    deepseek: state.series.deepseek,
    grok:     state.series.grok
  };
}
