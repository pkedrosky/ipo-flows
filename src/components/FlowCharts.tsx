import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  ReferenceLine,
} from "recharts";
import type { SimResult } from "../types";

interface Props {
  result: SimResult;
}

function fmtB(b: number) {
  if (b >= 1000) return `$${(b / 1000).toFixed(2)}T`;
  return `$${b.toFixed(1)}B`;
}

const CHART_COLORS = {
  days: "#b45309",
  drawdown: "#ef4444",
  monthly: "#1f6fdb",
};

// Custom tooltip for stock charts
function StockTooltip({
  active,
  payload,
  label,
  unit,
}: {
  active?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: readonly any[];
  label?: string | number;
  unit: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#d9e1ea] rounded-lg px-3 py-2 shadow-sm text-sm">
      <div className="font-semibold text-[#0f172a]">{String(label)}</div>
      <div className="text-[#64748b]">
        {(payload[0].value as number).toFixed(2)}
        {unit}
      </div>
    </div>
  );
}

export function FlowCharts({ result }: Props) {
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
      {/* Days of selling pressure */}
      <div className="bg-white border border-[#d9e1ea] rounded-xl p-5">
        <h3 className="text-sm font-semibold text-[#0f172a] mb-1">
          Days of Selling Pressure
        </h3>
        <p className="text-xs text-[#64748b] mb-4">
          Estimated outflow per stock divided by average daily volume (ADV)
        </p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={daysData}
            margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
          >
            <CartesianGrid vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="ticker"
              tick={{ fontSize: 12, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `${v}d`}
              width={32}
            />
            <Tooltip
              content={(props) => (
                <StockTooltip
                  {...props}
                  unit=" days"
                />
              )}
            />
            <ReferenceLine y={1} stroke="#e2e8f0" strokeDasharray="4 2" />
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
          Square-root market impact model: 1.5% × √(days of pressure). Rough
          estimate; assumes selling spread over the pressure period.
        </p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={drawdownData}
            margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
          >
            <CartesianGrid vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="ticker"
              tick={{ fontSize: 12, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `${v.toFixed(1)}%`}
              width={40}
            />
            <Tooltip
              content={(props) => (
                <StockTooltip
                  {...props}
                  unit="%"
                />
              )}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} fill={CHART_COLORS.drawdown}>
              {drawdownData.map((d, i) => (
                <Cell key={i} fill={d.color} opacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly outflow cadence */}
      <div className="bg-white border border-[#d9e1ea] rounded-xl p-5">
        <h3 className="text-sm font-semibold text-[#0f172a] mb-1">
          Outflow Cadence by Month
        </h3>
        <p className="text-xs text-[#64748b] mb-4">
          Total Mag 7 + Oracle selling pressure by IPO timing. Overlapping IPOs
          compound flows within a single month.
        </p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart
            data={monthlyData}
            margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
          >
            <CartesianGrid vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => fmtB(v)}
              width={48}
            />
            <Tooltip
              formatter={(v: unknown) => [fmtB(v as number), "Outflow"]}
              contentStyle={{
                fontSize: 12,
                borderColor: "#d9e1ea",
                borderRadius: 8,
              }}
            />
            <Bar
              dataKey="value"
              fill={CHART_COLORS.monthly}
              radius={[4, 4, 0, 0]}
              opacity={0.85}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
