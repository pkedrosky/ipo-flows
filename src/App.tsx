import { useState, useEffect } from "react";
import { IPOS, type SimParams, type IpoMonth } from "./types";
import { useFlowSim } from "./hooks/useFlowSim";
import { ControlPanel } from "./components/ControlPanel";
import { FlowCharts } from "./components/FlowCharts";
import { SummaryCards } from "./components/SummaryCards";
import { Insights } from "./components/Insights";

// --- URL param helpers ---

function getInitialParams(): SimParams {
  const sp = new URLSearchParams(window.location.search);

  const valuations: Record<string, number> = {};
  IPOS.forEach((ipo) => {
    const raw = sp.get(ipo.id);
    if (raw) {
      const v = parseFloat(raw);
      if (!isNaN(v) && v >= ipo.minValuation && v <= ipo.maxValuation) {
        valuations[ipo.id] = v;
      } else {
        valuations[ipo.id] = ipo.defaultValuation;
      }
    } else {
      valuations[ipo.id] = ipo.defaultValuation;
    }
  });

  const timings: Record<string, IpoMonth> = {};
  const validMonths: IpoMonth[] = [
    "Jul 2026", "Aug 2026", "Sep 2026", "Oct 2026", "Nov 2026", "Dec 2026",
  ];
  IPOS.forEach((ipo, i) => {
    const raw = sp.get(`t_${ipo.id}`);
    if (raw && validMonths.includes(raw as IpoMonth)) {
      timings[ipo.id] = raw as IpoMonth;
    } else {
      // Default: stagger roughly across Q3/Q4
      timings[ipo.id] = validMonths[i * 2] ?? validMonths[0];
    }
  });

  const floatPct = parseFloat(sp.get("float") ?? "0.15");
  const mag7Pct = parseFloat(sp.get("mag7") ?? "0.30");

  return {
    valuations,
    timings,
    floatPct: isNaN(floatPct) ? 0.15 : Math.max(0.05, Math.min(0.40, floatPct)),
    mag7Pct: isNaN(mag7Pct) ? 0.30 : Math.max(0, Math.min(0.80, mag7Pct)),
  };
}

function paramsToSearch(params: SimParams): string {
  const sp = new URLSearchParams();
  IPOS.forEach((ipo) => {
    sp.set(ipo.id, (params.valuations[ipo.id] ?? ipo.defaultValuation).toFixed(2));
    sp.set(`t_${ipo.id}`, params.timings[ipo.id]);
  });
  sp.set("float", params.floatPct.toFixed(2));
  sp.set("mag7", params.mag7Pct.toFixed(2));
  return sp.toString();
}

// --- App ---

export default function App() {
  const [params, setParams] = useState<SimParams>(getInitialParams);
  const result = useFlowSim(params);

  // Sync params → URL
  useEffect(() => {
    const qs = paramsToSearch(params);
    window.history.replaceState(null, "", `?${qs}`);
  }, [params]);

  // Report height to parent iframe (for Ghost/Nginx embed)
  useEffect(() => {
    const report = () => {
      const h = document.documentElement.scrollHeight;
      window.parent.postMessage({ type: "resize", height: h }, "*");
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
          Estimates selling pressure on Mag 7 + Oracle from capital rotation
          into SpaceX, OpenAI, and Anthropic IPOs. All values in nominal 2026
          dollars.
        </p>
      </div>

      <ControlPanel params={params} onChange={setParams} />
      <SummaryCards result={result} />
      <FlowCharts result={result} />
      <Insights result={result} params={params} />

      <p className="text-[11px] text-[#94a3b8] pb-2">
        Sources: Bloomberg ADV estimates; company filings; paulkedrosky.com.
        Drawdown modeled via square-root market impact (Almgren-Chriss). Not
        investment advice.
      </p>
    </div>
  );
}
