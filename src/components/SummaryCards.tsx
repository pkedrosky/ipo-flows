import type { SimResult } from "../types";

interface Props {
  result: SimResult;
}

function fmtB(b: number) {
  if (b >= 1000) return `$${(b / 1000).toFixed(2)}T`;
  return `$${b.toFixed(0)}B`;
}

function Card({
  label,
  value,
  sub,
  valueColor = "#0f172a",
}: {
  label: string;
  value: string;
  sub?: string;
  valueColor?: string;
}) {
  return (
    <div className="bg-white border border-[#d9e1ea] rounded-xl p-4">
      <div className="text-xs font-semibold uppercase tracking-widest text-[#64748b] mb-2">
        {label}
      </div>
      <div className="text-2xl font-bold" style={{ color: valueColor }}>
        {value}
      </div>
      {sub && <div className="text-xs text-[#94a3b8] mt-1">{sub}</div>}
    </div>
  );
}

export function SummaryCards({ result }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <Card
        label="Total Float"
        value={fmtB(result.totalFloatB)}
        sub="across all three IPOs"
      />
      <Card
        label="Mag 7 + Oracle Outflow"
        value={fmtB(result.totalOutflowB)}
        sub="estimated selling pressure"
        valueColor="#ef4444"
      />
      <Card
        label="Most Pressure (Days)"
        value={`${result.mostImpactedByDays.daysOfVolume.toFixed(1)}d`}
        sub={result.mostImpactedByDays.ticker}
        valueColor="#b45309"
      />
      <Card
        label="Peak Month"
        value={result.peakMonth}
        sub={`${fmtB(result.peakMonthOutflowB)} outflow`}
        valueColor="#1f6fdb"
      />
    </div>
  );
}
