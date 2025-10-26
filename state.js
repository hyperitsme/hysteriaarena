import fs from 'fs/promises';

const MODELS = ['gpt5','claude','deepseek','grok'];

export class State {
  constructor(file) { this.file = file; this.data = null; }

  async init() {
    try {
      const txt = await fs.readFile(this.file, 'utf8');
      this.data = JSON.parse(txt);
    } catch {
      this.data = {
        agents: {
          gpt5: { id:'gpt5', bankroll: 2.9215, pct: 0.12, trades: 458, win: 0.60, slip: 13.6 },
          claude: { id:'claude', bankroll: 1.6937, pct: 0.34, trades: 431, win: 0.57, slip: 13.3 },
          deepseek: { id:'deepseek', bankroll: 0.7213, pct: -0.22, trades: 446, win: 0.50, slip: 14.0 },
          grok: { id:'grok', bankroll: 0.5308, pct: -0.18, trades: 473, win: 0.45, slip: 13.7 }
        },
        series: {
          gpt5: [],
          claude: [],
          deepseek: [],
          grok: []
        },
        trades: [],
        positions: [
          { m:'Market Prices', BTC:'$43,250.50', ETH:'$2,280.75', SOL:'$98.42', BNB:'$573.12' }
        ],
        chat: []
      };
      // seed series so 4 lines are always present
      const seed = (base, slope) => {
        const out = []; let v = base;
        for (let i=0;i<240;i++) { v += slope + (Math.random()-0.5)*2; out.push({t:i, v}); }
        return out;
      };
      this.data.series.gpt5 = seed(1000, 1.9);
      this.data.series.claude = seed(700, 0.9);
      this.data.series.deepseek = seed(350, -0.6);
      this.data.series.grok = seed(320, -0.7);
      await this.flush();
    }
  }

  async flush() { await fs.writeFile(this.file, JSON.stringify(this.data)); }

  getSummary() { return { agents: Object.values(this.data.agents) }; }
  getSeries() { return this.data.series; }
  getTrades() { return this.data.trades.slice(-20).reverse(); }
  getPositions() { return this.data.positions; }
  getChat() { return this.data.chat.slice(-20).reverse(); }

  // mutations
  appendTrade(tr) { this.data.trades.push(tr); if (this.data.trades.length>200) this.data.trades.shift(); }
  appendChat(m) { this.data.chat.push(m); if (this.data.chat.length>200) this.data.chat.shift(); }
  updateAgent(id, patch) { Object.assign(this.data.agents[id], patch); }
  pushPoint(id, v) {
    const s = this.data.series[id];
    const t = s.length ? s[s.length-1].t + 1 : 0;
    s.push({t, v});
    if (s.length>360) s.shift();
  }
}
