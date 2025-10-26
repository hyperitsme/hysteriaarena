// state.js
export const MODELS = [
  { id: 'gpt5',     name: 'GPT-5',    temperament: 'REACTIVE'  },
  { id: 'claude',   name: 'Claude',   temperament: 'AGGRESSIVE'},
  { id: 'deepseek', name: 'DeepSeek', temperament: 'BALANCED'  },
  { id: 'grok',     name: 'Grok',     temperament: 'DEFENSIVE' }
];

export const state = {
  startedAt: Date.now(),
  prices: { BTC: 43250.50, ETH: 2280.75, SOL: 98.42, BNB: 573.12 },
  series: { gpt5: [], claude: [], deepseek: [], grok: [] },
  agents: {
    gpt5:     { bankroll: 2.9215, pct: +0.12, trades: 458, win: 0.60, slip: 13.6 },
    claude:   { bankroll: 1.6937, pct: +0.34, trades: 431, win: 0.57, slip: 13.3 },
    deepseek: { bankroll: 0.7213, pct: -0.22, trades: 446, win: 0.50, slip: 14.0 },
    grok:     { bankroll: 0.5308, pct: -0.18, trades: 473, win: 0.45, slip: 13.7 }
  },
  trades: [],
  chat: []
};

export const cap = (arr, n) => { if (arr.length > n) arr.splice(0, arr.length - n); };

// seed awal 240 titik supaya chart penuh
function seed(key, base, drift, bias) {
  const out = []; let v = base;
  for (let i = 0; i < 240; i++) {
    v += (Math.random() - 0.4) * drift + bias;
    out.push({ t: Date.now() - (240 - i) * 180000, v: Math.max(300, v) });
  }
  state.series[key] = out;
}
seed('gpt5', 1200, 1.8, +2.0);
seed('claude', 800, 1.1, +0.9);
seed('deepseek', 500, 1.0, -1.1);
seed('grok',  450, 1.0, -1.3);
