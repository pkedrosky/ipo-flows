import { useState, useEffect } from "react";
import { IPOS, type SimParams, type IpoMonth } from "./types";
import { useFlowSim } from "./hooks/useFlowSim";
import { ControlPanel } from "./components/ControlPanel";
import { FlowCharts } from "./components/FlowCharts";
import { SummaryCards } from "./components/SummaryCards";
import { Insights } from "./components/Insights";

const VALID_MONTHS: IpoMonth[] = [
  "Jul 2026", "Aug 2026", "Sep 2026", "Oct 2026", "Nov 2026", "Dec 2026",
];

// Default timings: stagger across Q3/Q4
const DEFAULT_TIMINGS: Record<string, IpoMonth> = {
  spacex:    "Jul 2026",
  openai:    "Sep 2026",
  anthropic: "Nov 2026",
};

function getInitialParams(): SimParams {
  const sp = new URLSearchParams(window.location.search);

  const valuations: Record<string, number> = {};
  IPOS.forEach((ipo) => {
    const raw = sp.get(ipo.id);
    const v = raw ? parseFloat(raw) : NaN;
    valuations[ipo.id] =
      !isNaN(v) && v >= ipo.minValuation && v <= ipo.maxValuation
        ? v
        : ipo.defaultValuation;
  });

  const timings: Record<string, IpoMonth> = {};
  IPOS.forEach((ipo) => {
    const raw = sp.get(`t_${ipo.id}`);
    timings[ipo.id] =
      raw && VALID_MONTHS.includes(raw as IpoMonth)
        ? (raw as IpoMonth)
        : DEFAULT_TIMINGS[ipo.id];
  });

  const mechIntensity = parseFloat(sp.get("mech") ?? "0.5");
  const subIntensity  = parseFloat(sp.get("sub")  ?? "0.5");
  const excludedRaw   = sp.get("excl");
  const excludedTickers = excludedRaw ? excludedRaw.split(",").filter(Boolean) : [];

  return {
    valuations,
    timings,
    mechIntensity: isNaN(mechIntensity) ? 0.5 : Math.max(0, Math.min(1, mechIntensity)),
    subIntensity:  isNaN(subIntensity)  ? 0.5 : Math.max(0, Math.min(1, subIntensity)),
    excludedTickers,
  };
}

function paramsToSearch(params: SimParams): string {
  const sp = new URLSearchParams();
  IPOS.forEach((ipo) => {
    sp.set(ipo.id, (params.valuations[ipo.id] ?? ipo.defaultValuation).toFixed(2));
    sp.set(`t_${ipo.id}`, params.timings[ipo.id]);
  });
  sp.set("mech", params.mechIntensity.toFixed(2));
  sp.set("sub",  params.subIntensity.toFixed(2));
  if (params.excludedTickers.length > 0) {
    sp.set("excl", params.excludedTickers.join(","));
  }
  return sp.toString();
}

export default function App() {
  const [params, setParams] = useState<SimParams>(getInitialParams);
  const result = useFlowSim(params);

  // Sync params → URL
  useEffect(() => {
    window.history.replaceState(null, "", `?${paramsToSearch(params)}`);
  }, [params]);

  // Report height to parent iframe
  useEffect(() => {
    const report = () => {
      window.parent.postMessage(
        { type: "resize", height: document.documentElement.scrollHeight },
        "*"
      );
    };
    report();
    const obs = new ResizeObserver(report);
    obs.observe(document.body);
    return () => obs.disconnect();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
      <div>
        <h1 className="text-xl font-bold text-[#0f172a]">
          IPO Flow Impact Simulator
        </h1>
        <p className="text-sm text-[#64748b] mt-1">
          Two-channel model of selling pressure on Mag 7 + Broadcom from the
          SpaceX, OpenAI, and Anthropic IPOs: mechanical index rebalancing plus
          substitution-driven proxy-premium compression.
        </p>
      </div>

      <ControlPanel params={params} onChange={setParams} />
      <SummaryCards result={result} />
      <FlowCharts result={result} />
      <Insights result={result} params={params} />

      <p className="text-[11px] text-[#94a3b8] pb-2">
        Sources: Bloomberg ADV estimates; company filings; paulkedrosky.com.
        Mechanical ranges per index rebalancing analysis; substitution ranges
        are judgment-based estimates. Drawdown via square-root market impact
        (Almgren-Chriss); understates re-rating risk for substitution-heavy names.
        Not investment advice.
      </p>
    </div>
  );
}
