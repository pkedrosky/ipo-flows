import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  Legend,
} from "recharts";
import type { SimResult } from "../types";

interface Props {
  result: SimResult;
}

function fmtB(b: number) {
  if (b >= 1000) return `$${(b / 1000).toFixed(2)}T`;
  return `$${b.toFixed(1)}B`;
}

// Custom tooltip for stacked outflow chart
function OutflowTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: readonly any[];
  label?: string | number;
}) {
  if (!active || !payload?.length) return null;
  const mech = payload.find((p: { name: string }) => p.name === "Mechanical")?.value ?? 0;
  const sub = payload.find((p: { name: string }) => p.name === "Substitution")?.value ?? 0;
  return (
    <div className="bg-white border border-[#d9e1ea] rounded-lg px-3 py-2 shadow-sm text-sm min-w-[160px]">
      <div className="font-semibold text-[#0f172a] mb-1">{String(label)}</div>
      <div className="flex justify-between gap-4">
        <span className="text-[#1f6fdb]">Mechanical</span>
        <span className="font-medium">{fmtB(mech as number)}</span>
      </div>
      <div className="flex justify-between gap-4">
        <span className="text-[#ef4444]">Substitution</span>
        <span className="font-medium">{fmtB(sub as number)}</span>
      </div>
      <div className="flex justify-between gap-4 border-t border-[#f1f5f9] mt-1 pt-1 font-semibold">
        <span className="text-[#0f172a]">Total</span>
        <span>{fmtB((mech as number) + (sub as number))}</span>
      </div>
    </div>
  );
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
      {proxy && <div className="text-[10px] text-[#94a3b8] mb-1">{proxy}</div>}
      <div className="text-[#64748b]">
        {(payload[0].value as number).toFixed(2)}{unit}
      </div>
    </div>
  );
}

export function FlowCharts({ result }: Props) {
  const proxyLabels = Object.fromEntries(
    result.stockImpacts.map((s) => [s.ticker, s.proxyLabel])
  );

  const outflowData = result.stockImpacts.map((s) => ({
    ticker: s.ticker,
    Mechanical: parseFloat(s.mechB.toFixed(1)),
    Substitution: parseFloat(s.subB.toFixed(1)),
    color: s.color,
  }));

  const daysData = result.stockImpacts.map((s) => ({
    ticker: s.ticker,
    value: parseFloat(s.daysOfVolume.toFixed(2)),
    color: s.color,
  }));

  const drawdownData = result.stockImpacts.map((s) => ({
    ticker: s.ticker,
    value: parseFloat(s.drawdownPct.toFixed(2)),
    color: s.color,
  }));

  const monthlyData = result.monthlyFlows.map((m) => ({
    month: m.month.slice(0, 3),
    value: parseFloat(m.totalOutflowB.toFixed(1)),
  }));

  return (
    <div className="space-y-4">

      {/* Stacked outflow by channel */}
      <div className="bg-white border border-[#d9e1ea] rounded-xl p-5">
        <h3 className="text-sm font-semibold text-[#0f172a] mb-1">
          Selling Pressure by Channel
        </h3>
        <p className="text-xs text-[#64748b] mb-4">
          Mechanical = index rebalancing (proportional to market cap, scales with valuation).
          Substitution = proxy-premium compression (per-stock, not proportional).
        </p>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={outflowData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="ticker" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false}
              tickFormatter={(v: number) => fmtB(v)} width={48} />
            <Tooltip content={(props) => <OutflowTooltip {...props} />} />
            <Legend
              iconType="square"
              iconSize={10}
              formatter={(value) => (
                <span className="text-xs text-[#64748b]">{value}</span>
              )}
            />
            <Bar dataKey="Mechanical" stackId="a" fill="#cbd5e1" radius={[0, 0, 0, 0]} />
            <Bar dataKey="Substitution" stackId="a" fill="#64748b" radius={[4, 4, 0, 0]}>
              {outflowData.map((d, i) => (
                <Cell key={i} fill={d.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Days of selling pressure */}
      <div className="bg-white border border-[#d9e1ea] rounded-xl p-5">
        <h3 className="text-sm font-semibold text-[#0f172a] mb-1">
          Days of Selling Pressure
        </h3>
        <p className="text-xs text-[#64748b] mb-4">
          Total estimated outflow divided by average daily volume (ADV). Thin-ADV names
          like Broadcom face disproportionate pressure relative to their dollar outflow.
        </p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={daysData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="ticker" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false}
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
        <h3 className="text-sm font-semibold text-[#0f172a] mb-1">
          Implied Price Drawdown
        </h3>
        <p className="text-xs text-[#64748b] mb-4">
          Square-root market impact model: 1.5% × √(days of pressure). This underestimates
          substitution-driven names — re-rating events don't revert the way flow events do.
        </p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={drawdownData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="ticker" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false}
              tickFormatter={(v: number) => `${v.toFixed(1)}%`} width={40} />
            <Tooltip content={(props) => <SimpleTooltip {...props} unit="%" proxyLabels={proxyLabels} />} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {drawdownData.map((d, i) => (
                <Cell key={i} fill={d.color} opacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly cadence */}
      <div className="bg-white border border-[#d9e1ea] rounded-xl p-5">
        <h3 className="text-sm font-semibold text-[#0f172a] mb-1">
          Outflow Cadence by Month
        </h3>
        <p className="text-xs text-[#64748b] mb-4">
          IPOs in the same month compound flows. Staggering reduces peak-month strain.
        </p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={monthlyData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false}
              tickFormatter={(v: number) => fmtB(v)} width={52} />
            <Tooltip
              formatter={(v: unknown) => [fmtB(v as number), "Outflow"]}
              contentStyle={{ fontSize: 12, borderColor: "#d9e1ea", borderRadius: 8 }}
            />
            <Bar dataKey="value" fill="#1f6fdb" radius={[4, 4, 0, 0]} opacity={0.8} />
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}
