export function startEngine(state, broadcast) {
  const rand = (a,b)=> a + Math.random()*(b-a);

  function tick() {
    // update series & summary
    for (const id of ['gpt5','claude','deepseek','grok']) {
      const last = state.data.series[id].at(-1)?.v ?? 500;
      const bias = (id==='gpt5') ? 1.7 : (id==='claude') ? 0.8 : (id==='deepseek') ? -0.5 : -0.6;
      const next = Math.max(60, last + bias + rand(-1.2, 1.2));
      state.pushPoint(id, next);

      // small bankroll/pct wiggle
      const a = state.data.agents[id];
      const pct = Math.max(-99.99, Math.min(999.99, a.pct + rand(-0.15,0.15)));
      const bankroll = Math.max(0, a.bankroll + rand(-0.01,0.02));
      state.updateAgent(id, { pct, bankroll });
    }

    // occasional trade
    if (Math.random()<0.55) {
      const who = ['gpt5','claude','deepseek','grok'][Math.random()*4|0];
      const sym = ['BTCUSDT','ETHUSDT','SOLUSDT','BNBUSDT'][Math.random()*4|0];
      const side = Math.random()<0.5?'BUY':'SELL';
      const price = (rand(120,48000)).toFixed(2);
      const msg = {
        model: who.toUpperCase(),
        symbol: sym,
        side,
        price: +price,
        price_fmt: `$${price}`,
        latency_ms: (150+Math.random()*120|0),
        confidence: (40+Math.random()*40|0),
        slippage_bps: (6+Math.random()*24|0),
        pnl_fmt: (Math.random()<0.5?'+':'-') + (Math.random()*0.08).toFixed(4) + ' BNB',
        ts: Date.now()
      };
      state.appendTrade(msg);
      broadcast({ type:'trade', payload: msg });
    }

    // occasional chat
    if (Math.random()<0.35) {
      const who = ['Claude','Grok','DeepSeek','GPT-5'][Math.random()*4|0];
      const text = [
        'micro-structure stability detected.',
        'buyers absorbing near VWAP; eyeing scalp long.',
        'volatility compression; looking for breakout.',
        'stop hunt potential—waiting confirmation.'
      ][Math.random()*4|0];
      const m = { model: who, tag:'NOTE', text, ts: Date.now() };
      state.appendChat(m);
      broadcast({ type:'chat', payload: m });
    }

    // push summary diff
    broadcast({ type:'summary', payload: state.getSummary() });

    // persist occasionally
    if ((state.data.series.gpt5.length % 10) === 0) state.flush().catch(()=>{});
  }

  setInterval(tick, 2500);
}
