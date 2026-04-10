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
      <h3 className="text-sm font-semibold uppercase tracking-widest text-[#64748b] mb-4">
        What This Means
      </h3>
      <ul className="space-y-3 text-base text-[#374151] leading-relaxed">

        <li>
          <span className="font-semibold text-[#0f172a]">{mostImpactedByDays.ticker} is the most exposed.</span>{" "}
          {mostImpactedByDays.daysOfVolume.toFixed(1)} days of selling pressure — more than any other name.
          It has been the market's proxy for {mostImpactedByDays.proxyLabel.toLowerCase()};
          once that's directly purchasable, the premium evaporates.
          {highestSubStock.ticker !== mostImpactedByDays.ticker && (
            <> {highestSubStock.ticker} carries the largest raw substitution exposure at {fmtB(highestSubStock.subB)}.</>
          )}{" "}
          {subShare}% of total estimated selling is substitution — the part that doesn't reverse after the IPO closes.
        </li>

        <li>
          <span className="font-semibold text-[#0f172a]">The drawdown numbers are floors.</span>{" "}
          {msft.drawdownPct.toFixed(1)}% implied for MSFT doesn't capture what happens to a stock
          priced partly as an OpenAI proxy once OpenAI lists. That repricing is structural.
          High-substitution names ({highestSubStock.ticker}, GOOGL, NVDA) will likely underperform
          the model's output, not match it.
        </li>

        <li>
          <span className="font-semibold text-[#0f172a]">AVGO is disproportionately fragile.</span>{" "}
          $3B/day ADV — the thinnest in the group — produces {avgo.daysOfVolume.toFixed(1)}d of pressure
          from a relatively small dollar outflow.{" "}
          {stackedMonths.length > 0 ? (
            <>
              {stackedMonths.map(([m, c]) => `${c} IPOs land in ${m}`).join(", ")}, stacking flows
              rather than spreading them. Stagger the timing and peak pressure drops sharply.
            </>
          ) : (
            <>
              IPOs are currently spread across separate months. Stack two in the same month
              and the pressure on every name multiplies.
            </>
          )}
        </li>

      </ul>
    </div>
  );
}
