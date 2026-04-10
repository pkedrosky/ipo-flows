// IPO definitions
export interface IPO {
  id: string;
  name: string;
  defaultValuation: number; // in trillions
  minValuation: number;
  maxValuation: number;
  color: string;
}

// Base total valuation the substitution ranges are calibrated to
export const BASE_TOTAL_VALUATION = 3.75; // $T

// Float % the mechanical ranges are calibrated to
export const BASE_FLOAT_PCT = 0.15;

export const IPOS: IPO[] = [
  {
    id: "spacex",
    name: "SpaceX",
    defaultValuation: 2.0,
    minValuation: 1.4,
    maxValuation: 2.6,
    color: "#1a1a2e",
  },
  {
    id: "openai",
    name: "OpenAI",
    defaultValuation: 0.75,
    minValuation: 0.53,
    maxValuation: 0.98,
    color: "#10a37f",
  },
  {
    id: "anthropic",
    name: "Anthropic",
    defaultValuation: 1.0,
    minValuation: 0.7,
    maxValuation: 1.3,
    color: "#c96442",
  },
];

// H2 2026 months available for IPO timing
export type IpoMonth =
  | "Jul 2026"
  | "Aug 2026"
  | "Sep 2026"
  | "Oct 2026"
  | "Nov 2026"
  | "Dec 2026";

export const IPO_MONTHS: IpoMonth[] = [
  "Jul 2026",
  "Aug 2026",
  "Sep 2026",
  "Oct 2026",
  "Nov 2026",
  "Dec 2026",
];

// Stock data — Mag 7 + Broadcom (replaces Oracle as the AI networking proxy)
// mechMin/mechMax: mechanical index-rebalancing pressure range ($B)
// subMin/subMax: substitution/proxy-premium-compression range ($B)
// proxyLabel: what thesis this stock was proxying before the IPOs
export interface Stock {
  ticker: string;
  name: string;
  marketCap: number; // $T
  adv: number;       // avg daily volume $B
  color: string;
  mechMin: number;   // $B
  mechMax: number;   // $B
  subMin: number;    // $B
  subMax: number;    // $B
  proxyLabel: string;
}

export const STOCKS: Stock[] = [
  {
    ticker: "MSFT",
    name: "Microsoft",
    marketCap: 2.9,
    adv: 8,
    color: "#0078d4",
    mechMin: 20, mechMax: 30,
    subMin: 80,  subMax: 150,
    proxyLabel: "OpenAI stake (49%)",
  },
  {
    ticker: "GOOGL",
    name: "Alphabet",
    marketCap: 2.0,
    adv: 7,
    color: "#4285f4",
    mechMin: 20, mechMax: 30,
    subMin: 60,  subMax: 120,
    proxyLabel: "Anthropic stake + search AI defense",
  },
  {
    ticker: "NVDA",
    name: "Nvidia",
    marketCap: 2.6,
    adv: 30,
    color: "#76b900",
    mechMin: 20, mechMax: 30,
    subMin: 50,  subMax: 100,
    proxyLabel: "AI infrastructure demand",
  },
  {
    ticker: "AMZN",
    name: "Amazon",
    marketCap: 2.2,
    adv: 8,
    color: "#ff9900",
    mechMin: 15, mechMax: 25,
    subMin: 40,  subMax: 80,
    proxyLabel: "Anthropic stake + Bedrock",
  },
  {
    ticker: "META",
    name: "Meta",
    marketCap: 1.5,
    adv: 8,
    color: "#0866ff",
    mechMin: 15, mechMax: 25,
    subMin: 20,  subMax: 40,
    proxyLabel: "AI product competition",
  },
  {
    ticker: "AAPL",
    name: "Apple",
    marketCap: 3.1,
    adv: 12,
    color: "#555555",
    mechMin: 15, mechMax: 25,
    subMin: 10,  subMax: 20,
    proxyLabel: "Weakest AI proxy",
  },
  {
    ticker: "AVGO",
    name: "Broadcom",
    marketCap: 0.8,
    adv: 3,
    color: "#cc0000",
    mechMin: 10, mechMax: 20,
    subMin: 20,  subMax: 40,
    proxyLabel: "AI networking infrastructure",
  },
];

// Simulation parameters
export interface SimParams {
  valuations: Record<string, number>; // IPO id → $T
  timings: Record<string, IpoMonth>;  // IPO id → month
  floatPct: number;      // 0–1, share of each IPO offered at listing
}

// Per-stock output
export interface StockImpact {
  ticker: string;
  name: string;
  color: string;
  proxyLabel: string;
  mechB: number;       // mechanical outflow $B
  subB: number;        // substitution outflow $B
  totalB: number;      // total $B
  daysOfVolume: number;
  drawdownPct: number;
}

// Monthly flow breakdown
export interface MonthlyFlow {
  month: IpoMonth;
  totalOutflowB: number;
}

// Full simulation output
export interface SimResult {
  totalMechB: number;
  totalSubB: number;
  totalOutflowB: number;
  stockImpacts: StockImpact[];
  monthlyFlows: MonthlyFlow[];
  mostImpactedByDays: StockImpact;
  mostImpactedByDrawdown: StockImpact;
  highestSubStock: StockImpact;
  peakMonth: IpoMonth;
  peakMonthOutflowB: number;
}
