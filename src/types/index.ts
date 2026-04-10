// IPO definitions
export interface IPO {
  id: string;
  name: string;
  defaultValuation: number; // in trillions
  minValuation: number;
  maxValuation: number;
  color: string;
}

export const IPOS: IPO[] = [
  {
    id: "spacex",
    name: "SpaceX",
    defaultValuation: 2.0,
    minValuation: 1.8,
    maxValuation: 2.2,
    color: "#1a1a2e",
  },
  {
    id: "openai",
    name: "OpenAI",
    defaultValuation: 0.75,
    minValuation: 0.68,
    maxValuation: 0.83,
    color: "#10a37f",
  },
  {
    id: "anthropic",
    name: "Anthropic",
    defaultValuation: 1.0,
    minValuation: 0.9,
    maxValuation: 1.1,
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

// Mag 7 + Oracle stock data
export interface Stock {
  ticker: string;
  name: string;
  marketCap: number; // in trillions
  adv: number;       // average daily volume in billions
  color: string;
}

export const STOCKS: Stock[] = [
  { ticker: "AAPL", name: "Apple",   marketCap: 3.1,  adv: 12,  color: "#555555" },
  { ticker: "MSFT", name: "Microsoft", marketCap: 2.9, adv: 8,  color: "#0078d4" },
  { ticker: "NVDA", name: "Nvidia",  marketCap: 2.6,  adv: 30,  color: "#76b900" },
  { ticker: "AMZN", name: "Amazon",  marketCap: 2.2,  adv: 8,   color: "#ff9900" },
  { ticker: "GOOGL", name: "Alphabet", marketCap: 2.0, adv: 7,  color: "#4285f4" },
  { ticker: "META", name: "Meta",    marketCap: 1.5,  adv: 8,   color: "#0866ff" },
  { ticker: "TSLA", name: "Tesla",   marketCap: 0.9,  adv: 25,  color: "#cc0000" },
  { ticker: "ORCL", name: "Oracle",  marketCap: 0.5,  adv: 3,   color: "#f80000" },
];

// Simulation parameters
export interface SimParams {
  valuations: Record<string, number>; // keyed by IPO id, in trillions
  timings: Record<string, IpoMonth>;  // keyed by IPO id
  floatPct: number;                   // 0–1
  mag7Pct: number;                    // 0–1, share of demand from Mag7/Oracle selling
}

// Per-stock simulation output
export interface StockImpact {
  ticker: string;
  name: string;
  color: string;
  outflowB: number;   // outflow in $ billions
  daysOfVolume: number;
  drawdownPct: number; // implied price drawdown %
}

// Monthly flow breakdown (for stacking by IPO)
export interface MonthlyFlow {
  month: IpoMonth;
  totalOutflowB: number;
}

// Full simulation output
export interface SimResult {
  totalFloatB: number;
  totalOutflowB: number;
  stockImpacts: StockImpact[];
  monthlyFlows: MonthlyFlow[];
  mostImpactedByDays: StockImpact;
  mostImpactedByDrawdown: StockImpact;
  peakMonth: IpoMonth;
  peakMonthOutflowB: number;
}
