import { useState, useEffect } from "react";
import { IPOS, type SimParams, type IpoMonth } from "./types";
import { useFlowSim } from "./hooks/useFlowSim";
import { ControlPanel } from "./components/ControlPanel";
import { FlowCharts } from "./components/FlowCharts";
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

  const floatPct = parseFloat(sp.get("float") ?? "0.15");

  return {
    valuations,
    timings,
    floatPct: isNaN(floatPct) ? 0.15 : Math.max(0.05, Math.min(0.40, floatPct)),
  };
}

function paramsToSearch(params: SimParams): string {
  const sp = new URLSearchParams();
  IPOS.forEach((ipo) => {
    sp.set(ipo.id, (params.valuations[ipo.id] ?? ipo.defaultValuation).toFixed(2));
    sp.set(`t_${ipo.id}`, params.timings[ipo.id]);
  });
  sp.set("float", params.floatPct.toFixed(2));
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
      <h1 className="text-2xl font-bold text-[#0f172a]">
        IPO Flow Impact Simulator
      </h1>

      <ControlPanel params={params} onChange={setParams} />
      <FlowCharts result={result} />
      <Insights result={result} params={params} />

      <p className="text-sm text-[#94a3b8] pb-2">
        Drawdown estimates use square-root market impact (Almgren-Chriss) and
        understate re-rating risk for substitution-heavy names. Not investment advice.
      </p>
    </div>
  );
}
