// state.js
export const MODELS = [
  { id: 'gpt5',     name: 'GPT-5',     temperament: 'REACTIVE'  },
  { id: 'claude',   name: 'Claude',    temperament: 'AGGRESSIVE'},
  { id: 'deepseek', name: 'DeepSeek',  temperament: 'BALANCED'  },
  { id: 'grok',     name: 'Grok',      temperament: 'DEFENSIVE' }
];

// in-memory state (cukup untuk demo realtime; restart server = reset)
export const state = {
  startedAt: Date.now(),
  prices: { BTC: 43250.50, ETH: 2280.75, SOL: 98.42, BNB: 573.12 },

  // series: map model -> array of {t, v}
  series: {
    gpt5: [], claude: [], deepseek: [], grok: []
  },

  // ringkasan top card
  agents: {
    gpt5:     { bankroll: 2.9215, pct: +0.12, trades: 458, win: 0.60, slip: 13.6 },
    claude:   { bankroll: 1.6937, pct: +0.34, trades: 431, win: 0.57, slip: 13.3 },
    deepseek: { bankroll: 0.7213, pct: -0.22, trades: 446, win: 0.50, slip: 14.0 },
    grok:     { bankroll: 0.5308, pct: -0.18, trades: 473, win: 0.45, slip: 13.7 }
  },

  trades: [],   // array of trade objects (max 200)
  chat: []      // array of chat messages (max 200)
};

// seed 240 titik awal agar chart langsung penuh
function seedSeries(key, base, drift) {
  const arr = [];
  let v = base;
  for (let i = 0; i < 240; i++) {
    v += (Math.random() - 0.4) * drift + (key === 'gpt5' ? 2.0 : key === 'claude' ? 0.9 : key === 'deepseek' ? -1.1 : -1.3);
    arr.push({ t: Date.now() - (240 - i) * 180000, v: Math.max(300, v) });
  }
  state.series[key] = arr;
}
seedSeries('gpt5', 1200, 1.8);
seedSeries('claude', 800, 1.1);
seedSeries('deepseek', 500, 1.0);
seedSeries('grok',  450, 1.0);

// helper
export const cap = (arr, n) => { if (arr.length > n) arr.splice(0, arr.length - n); };
