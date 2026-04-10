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
  const {
    totalMechB,
    totalSubB,
    totalOutflowB,
    mostImpactedByDays,
    highestSubStock,
    stockImpacts,
  } = result;

  const subShare = totalOutflowB > 0
    ? Math.round((totalSubB / totalOutflowB) * 100)
    : 0;

  // Intensity characterization
  const subLevel =
    params.subIntensity > 0.75 ? "high" :
    params.subIntensity > 0.4  ? "mid-range" : "conservative";

  // Stacking check
  const monthCounts: Record<string, number> = {};
  IPOS.forEach((ipo) => {
    const m = params.timings[ipo.id];
    monthCounts[m] = (monthCounts[m] ?? 0) + 1;
  });
  const stackedMonths = Object.entries(monthCounts).filter(([, c]) => c > 1);

  // AVGO note: thin ADV makes it a disproportionate days story
  const avgo = stockImpacts.find((s) => s.ticker === "AVGO")!;
  const msft = stockImpacts.find((s) => s.ticker === "MSFT")!;

  return (
    <div className="bg-white border border-[#d9e1ea] rounded-xl p-5">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-[#64748b] mb-4">
        What This Means
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm text-[#374151] leading-relaxed">

        {/* Block 1: Two-channel overview */}
        <div>
          <div className="font-semibold text-[#0f172a] mb-1">Two Channels</div>
          At these assumptions, total estimated selling pressure is{" "}
          <strong>{fmtB(totalOutflowB)}</strong> — {fmtB(totalMechB)} mechanical
          and {fmtB(totalSubB)} from substitution. The substitution channel
          accounts for <strong>{subShare}%</strong> of the total and is the
          dominant driver. That ratio matters: mechanical selling is a one-time,
          well-telegraphed event that markets will front-run and absorb.
          Substitution pressure is structural — it doesn't reverse after the
          IPO is placed.
        </div>

        {/* Block 2: Re-rating vs. flow */}
        <div>
          <div className="font-semibold text-[#0f172a] mb-1">Re-rating, Not Just Flows</div>
          <strong>{highestSubStock.ticker}</strong> faces the largest
          substitution exposure ({fmtB(highestSubStock.subB)}) as the
          direct proxy for {highestSubStock.proxyLabel.toLowerCase()}. The
          drawdown model ({fmtPct(msft.drawdownPct)} implied for MSFT) almost
          certainly understates the risk for high-substitution names — the
          square-root model captures flow impact, not multiple compression.
          A 30x earnings stock that was partly pricing OpenAI optionality
          doesn't re-rate back once that optionality is directly purchasable.
        </div>

        {/* Block 3: Concentration and timing */}
        <div>
          <div className="font-semibold text-[#0f172a] mb-1">
            Concentration Risk
          </div>
          Broadcom's thin ADV ($3B/day) leaves it facing{" "}
          <strong>{avgo.daysOfVolume.toFixed(1)} days</strong> of pressure
          despite its smaller dollar outflow — disproportionate relative to its
          weight. {mostImpactedByDays.ticker !== "AVGO" && (
            <>
              {mostImpactedByDays.ticker} carries the most days overall at{" "}
              <strong>{mostImpactedByDays.daysOfVolume.toFixed(1)}d</strong>.{" "}
            </>
          )}
          {stackedMonths.length > 0 ? (
            <>
              With {stackedMonths.map(([m, c]) => `${c} IPOs in ${m}`).join(" and ")},
              flows concentrate rather than spread — compounding pressure in a
              narrow window. The {subLevel} substitution assumption used here
              is the key uncertainty in the total.
            </>
          ) : (
            <>
              IPOs are spread across separate months, reducing peak-month
              concentration. The {subLevel} substitution assumption remains
              the dominant uncertainty.
            </>
          )}
        </div>

      </div>
    </div>
  );
}
