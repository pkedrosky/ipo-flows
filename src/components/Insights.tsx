import type { SimResult, SimParams } from "../types";
import { IPOS } from "../types";

interface Props {
  result: SimResult;
  params: SimParams;
}

function fmtB(b: number) {
  if (b >= 1000) return `$${(b / 1000).toFixed(2)}T`;
  return `$${b.toFixed(0)}B`;
}

function fmtPct(p: number) {
  return `${p.toFixed(1)}%`;
}

export function Insights({ result, params }: Props) {
  const { mostImpactedByDays, mostImpactedByDrawdown, totalFloatB, totalOutflowB } = result;

  const totalValuation = IPOS.reduce(
    (s, ipo) => s + (params.valuations[ipo.id] ?? ipo.defaultValuation),
    0
  );

  // Classify pressure level
  const maxDays = Math.max(...result.stockImpacts.map((s) => s.daysOfVolume));
  const pressureLevel =
    maxDays > 10
      ? "severe"
      : maxDays > 5
      ? "significant"
      : maxDays > 2
      ? "moderate"
      : "modest";

  // Identify if any IPOs are stacked in the same month
  const monthCounts: Record<string, number> = {};
  IPOS.forEach((ipo) => {
    const m = params.timings[ipo.id];
    monthCounts[m] = (monthCounts[m] ?? 0) + 1;
  });
  const stackedMonths = Object.entries(monthCounts).filter(([, c]) => c > 1);
  const hasStacking = stackedMonths.length > 0;

  // Oracle note: small ADV makes it disproportionately affected
  const oracle = result.stockImpacts.find((s) => s.ticker === "ORCL")!;
  const oracleIsWorst = mostImpactedByDays.ticker === "ORCL";

  return (
    <div className="bg-white border border-[#d9e1ea] rounded-xl p-5">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-[#64748b] mb-4">
        What This Means
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm text-[#374151] leading-relaxed">
        {/* Block 1: Overall flow narrative */}
        <div>
          <div className="font-semibold text-[#0f172a] mb-1">Flow Overview</div>
          At these assumptions, the three IPOs together represent{" "}
          <strong>{fmtB(totalValuation * 1000)}</strong> in combined valuation
          with a <strong>{Math.round(params.floatPct * 100)}% float</strong>,
          producing <strong>{fmtB(totalFloatB)}</strong> in total new equity to
          absorb. Of that,{" "}
          <strong>{Math.round(params.mag7Pct * 100)}%</strong> —{" "}
          <strong>{fmtB(totalOutflowB)}</strong> — is assumed to come from
          rotation out of Mag 7 and Oracle.
        </div>

        {/* Block 2: Per-stock pressure */}
        <div>
          <div className="font-semibold text-[#0f172a] mb-1">
            Stock-Level Pressure
          </div>
          Selling pressure is {pressureLevel} under these assumptions.{" "}
          <strong>{mostImpactedByDays.ticker}</strong> faces the most days of
          flow ({mostImpactedByDays.daysOfVolume.toFixed(1)}d) while{" "}
          <strong>{mostImpactedByDrawdown.ticker}</strong> sees the largest
          implied drawdown ({fmtPct(mostImpactedByDrawdown.drawdownPct)}).{" "}
          {!oracleIsWorst && (
            <>
              Despite a smaller absolute outflow, Oracle's thin ADV of{" "}
              <strong>$3B/day</strong> leaves it exposed to{" "}
              <strong>{oracle.daysOfVolume.toFixed(1)} days</strong> of
              pressure — disproportionate to its market cap weight.
            </>
          )}
          {oracleIsWorst && (
            <>
              Oracle's thin ADV of <strong>$3B/day</strong> makes it the most
              flow-stressed name despite its small cap weight.
            </>
          )}
        </div>

        {/* Block 3: Timing and model notes */}
        <div>
          <div className="font-semibold text-[#0f172a] mb-1">
            Timing & Model Notes
          </div>
          {hasStacking ? (
            <>
              With{" "}
              {stackedMonths.map(([m, c]) => `${c} IPOs in ${m}`).join(" and ")}
              , flows concentrate rather than spread — compounding pressure in{" "}
              <strong>{result.peakMonth}</strong>. Staggering IPOs across
              separate months would reduce peak-month strain.{" "}
            </>
          ) : (
            <>
              IPOs are spread across different months, distributing selling
              pressure rather than concentrating it.{" "}
            </>
          )}
          Drawdown estimates use a square-root market impact model calibrated
          to large-cap daily volatility (~1.5%). Actual impact depends on
          market conditions, passive vs. active fund mix, and whether index
          inclusion absorbs demand before heavy selling begins.
        </div>
      </div>
    </div>
  );
}
