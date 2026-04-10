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

export function Insights({ result, params }: Props) {
  const {
    mostImpactedByDays,
    highestSubStock,
    stockImpacts,
    totalSubB,
    totalOutflowB,
  } = result;

  const subShare = totalOutflowB > 0
    ? Math.round((totalSubB / totalOutflowB) * 100)
    : 0;

  // Stacking check
  const monthCounts: Record<string, number> = {};
  IPOS.forEach((ipo) => {
    const m = params.timings[ipo.id];
    monthCounts[m] = (monthCounts[m] ?? 0) + 1;
  });
  const stackedMonths = Object.entries(monthCounts).filter(([, c]) => c > 1);

  const avgo = stockImpacts.find((s) => s.ticker === "AVGO")!;
  const msft = stockImpacts.find((s) => s.ticker === "MSFT")!;

  return (
    <div className="bg-white border border-[#d9e1ea] rounded-xl p-5">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-[#64748b] mb-4">
        What This Means
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm text-[#374151] leading-relaxed">

        {/* Block 1: The dominant name */}
        <div>
          <div className="font-semibold text-[#0f172a] mb-1">
            {mostImpactedByDays.ticker} Is the Biggest Problem
          </div>
          {mostImpactedByDays.daysOfVolume.toFixed(1)} days of selling pressure —
          more than any other name. The driver is substitution:{" "}
          {mostImpactedByDays.ticker} has been the market's shortcut for owning{" "}
          {mostImpactedByDays.proxyLabel.toLowerCase()}. Once that's directly
          purchasable, the premium evaporates.{" "}
          {highestSubStock.ticker !== mostImpactedByDays.ticker && (
            <>
              {highestSubStock.ticker} carries the largest raw substitution
              exposure at {fmtB(highestSubStock.subB)}.{" "}
            </>
          )}
          {subShare}% of total estimated selling is substitution — the part
          that doesn't reverse after the IPO closes.
        </div>

        {/* Block 2: Drawdown floors */}
        <div>
          <div className="font-semibold text-[#0f172a] mb-1">
            The Drawdown Numbers Are Floors
          </div>
          {msft.drawdownPct.toFixed(1)}% implied for MSFT, but that's just
          the mechanical flow impact. It doesn't capture what happens to a
          stock that was partly priced as an OpenAI proxy once OpenAI lists.
          That repricing is structural — it doesn't bounce back once investors
          can buy the real thing. Stocks with high substitution exposure
          ({highestSubStock.ticker}, GOOGL, NVDA) are likely to underperform
          the model's output, not match it.
        </div>

        {/* Block 3: AVGO + timing */}
        <div>
          <div className="font-semibold text-[#0f172a] mb-1">
            AVGO and the Stacking Risk
          </div>
          Broadcom trades $3B/day — the thinnest ADV in the group.
          That produces {avgo.daysOfVolume.toFixed(1)}d of pressure from a
          relatively small dollar outflow. Small position, outsized duration.{" "}
          {stackedMonths.length > 0 ? (
            <>
              More urgently:{" "}
              {stackedMonths.map(([m, c]) => `${c} IPOs land in ${m}`).join(", ")}.
              When flows concentrate in a single month, the pressure on every
              name multiplies — there's no natural spread to dampen it.
              Stagger the timing and the peak drops sharply.
            </>
          ) : (
            <>
              The current timing spreads IPOs across separate months, which
              limits peak-month concentration. Any scenario where two IPOs
              land in the same month changes the calculus significantly.
            </>
          )}
        </div>

      </div>
    </div>
  );
}
