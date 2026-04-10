import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import type { SimResult } from "../types";

interface Props {
  result: SimResult;
}

// Custom tooltip for days/drawdown charts
function SimpleTooltip({
  active,
  payload,
  label,
  unit,
  proxyLabels,
}: {
  active?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: readonly any[];
  label?: string | number;
  unit: string;
  proxyLabels: Record<string, string>;
}) {
  if (!active || !payload?.length) return null;
  const proxy = proxyLabels[String(label)];
  return (
    <div className="bg-white border border-[#d9e1ea] rounded-lg px-3 py-2 shadow-sm text-sm">
      <div className="font-semibold text-[#0f172a]">{String(label)}</div>
      {proxy && <div className="text-xs text-[#94a3b8] mb-1">{proxy}</div>}
      <div className="text-[#64748b]">
        {(payload[0].value as number) < 0
          ? `−${Math.abs(payload[0].value as number).toFixed(2)}${unit}`
          : `${(payload[0].value as number).toFixed(2)}${unit}`}
      </div>
    </div>
  );
}

export function FlowCharts({ result }: Props) {
  const proxyLabels = Object.fromEntries(
    result.stockImpacts.map((s) => [s.ticker, s.proxyLabel])
  );

  const daysData = result.stockImpacts.map((s) => ({
    ticker: s.ticker,
    value: parseFloat(s.daysOfVolume.toFixed(2)),
    color: s.color,
  }));

  const drawdownData = result.stockImpacts.map((s) => ({
    ticker: s.ticker,
    value: parseFloat((-s.drawdownPct).toFixed(2)),
    color: s.color,
  }));

  return (
    <div className="space-y-4">

      {/* Days of selling pressure */}
      <div className="bg-white border border-[#d9e1ea] rounded-xl p-5">
        <h3 className="text-base font-semibold text-[#0f172a] mb-1">
          Days of Selling Pressure
        </h3>
        <p className="text-sm text-[#64748b] mb-4">
          Peak-month outflow ÷ average daily volume, based on selected IPO
          timing. Thin-ADV names absorb concentrated pressure over more days.
        </p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={daysData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="ticker" tick={{ fontSize: 13, fill: "#64748b" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false}
              tickFormatter={(v: number) => `${v}d`} width={32} />
            <Tooltip content={(props) => <SimpleTooltip {...props} unit=" days" proxyLabels={proxyLabels} />} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {daysData.map((d, i) => (
                <Cell key={i} fill={d.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Implied drawdown */}
      <div className="bg-white border border-[#d9e1ea] rounded-xl p-5">
        <h3 className="text-base font-semibold text-[#0f172a] mb-1">
          Implied Price Drawdown
        </h3>
        <p className="text-sm text-[#64748b] mb-4">
          Square-root market impact: 1.5% × √(peak-month days). A floor estimate
          — substitution-driven names face additional multiple compression that
          doesn't revert after the IPO clears.
        </p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={drawdownData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="ticker" tick={{ fontSize: 13, fill: "#64748b" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false}
              tickFormatter={(v: number) => `${v.toFixed(1)}%`} width={40}
              domain={["dataMin", 0]} />
            <Tooltip content={(props) => <SimpleTooltip {...props} unit="%" proxyLabels={proxyLabels} />} />
            <Bar dataKey="value" radius={[0, 0, 4, 4]}>
              {drawdownData.map((d, i) => (
                <Cell key={i} fill={d.color} opacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}
