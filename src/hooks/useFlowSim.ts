import { useMemo } from "react";
import {
  IPOS,
  STOCKS,
  IPO_MONTHS,
  BASE_TOTAL_VALUATION,
  BASE_FLOAT_PCT,
  type SimParams,
  type SimResult,
  type StockImpact,
  type MonthlyFlow,
  type IpoMonth,
} from "../types";

// Square-root market impact model, calibrated to large-cap empirics.
// ~1.5% daily vol → impact = DAILY_VOL_PCT × √(days of selling pressure)
const DAILY_VOL_PCT = 1.5;

// Linear interpolation between min and max driven by intensity (0–1)
function lerp(min: number, max: number, t: number): number {
  return min + (max - min) * t;
}

export function useFlowSim(params: SimParams): SimResult {
  return useMemo(() => {
    const { valuations, timings, floatPct, mechIntensity, subIntensity, excludedTickers } = params;
    const excluded = new Set(excludedTickers);

    // Valuation scalar: mechanical pressure scales with total IPO valuation
    // relative to the baseline ($3.75T) the ranges were calibrated to.
    const totalValuation = IPOS.reduce(
      (s, ipo) => s + (valuations[ipo.id] ?? ipo.defaultValuation),
      0
    );
    const valScalar = totalValuation / BASE_TOTAL_VALUATION;

    // Float scalar: mechanical pressure scales proportionally with float %.
    // Substitution does not — re-rating happens because the IPO exists,
    // regardless of how many shares are offered at listing.
    const floatScalar = floatPct / BASE_FLOAT_PCT;

    // Per-stock two-channel calculation
    const stockImpacts: StockImpact[] = STOCKS.map((stock) => {
      // Excluded stocks absorb no outflow — their holders are assumed not to
      // participate in the rotation. Total pressure decreases; no redistribution.
      if (excluded.has(stock.ticker)) {
        return {
          ticker: stock.ticker,
          name: stock.name,
          color: stock.color,
          proxyLabel: stock.proxyLabel,
          mechB: 0,
          subB: 0,
          totalB: 0,
          daysOfVolume: 0,
          drawdownPct: 0,
        };
      }

      // Mechanical: index rebalancing, proportional to market cap.
      // Scaled by where the user sits on the mechanical intensity slider,
      // and by IPO valuation relative to baseline.
      const mechB = lerp(stock.mechMin, stock.mechMax, mechIntensity) * valScalar * floatScalar;

      // Substitution: proxy-premium compression.
      // NOT scaled by valuation — this is a re-rating driven by the
      // availability of direct ownership, not by float size.
      const subB = lerp(stock.subMin, stock.subMax, subIntensity);

      const totalB = mechB + subB;
      const daysOfVolume = totalB / stock.adv;

      // Square-root impact model for price drawdown.
      // Note: substitution pressure is a re-rating, not a pure flow event,
      // so this underestimates the true drawdown for substitution-heavy names.
      const drawdownPct = DAILY_VOL_PCT * Math.sqrt(daysOfVolume);

      return {
        ticker: stock.ticker,
        name: stock.name,
        color: stock.color,
        proxyLabel: stock.proxyLabel,
        mechB,
        subB,
        totalB,
        daysOfVolume,
        drawdownPct,
      };
    });

    const totalMechB = stockImpacts.reduce((s, st) => s + st.mechB, 0);
    const totalSubB = stockImpacts.reduce((s, st) => s + st.subB, 0);
    const totalOutflowB = totalMechB + totalSubB;

    // Monthly cadence: distribute each IPO's proportional share of total
    // outflow into its chosen month.
    const ipoShares = IPOS.map((ipo) => {
      const val = valuations[ipo.id] ?? ipo.defaultValuation;
      return { id: ipo.id, share: val / totalValuation };
    });

    const monthTotals: Partial<Record<IpoMonth, number>> = {};
    for (const { id, share } of ipoShares) {
      const month = timings[id];
      monthTotals[month] = (monthTotals[month] ?? 0) + totalOutflowB * share;
    }

    const monthlyFlows: MonthlyFlow[] = IPO_MONTHS.map((month) => ({
      month,
      totalOutflowB: monthTotals[month] ?? 0,
    }));

    // Highlights
    const byDays = [...stockImpacts].sort((a, b) => b.daysOfVolume - a.daysOfVolume);
    const byDrawdown = [...stockImpacts].sort((a, b) => b.drawdownPct - a.drawdownPct);
    const bySub = [...stockImpacts].sort((a, b) => b.subB - a.subB);

    const peakMonthFlow = monthlyFlows.reduce((best, m) =>
      m.totalOutflowB > best.totalOutflowB ? m : best
    );

    return {
      totalMechB,
      totalSubB,
      totalOutflowB,
      stockImpacts,
      monthlyFlows,
      mostImpactedByDays: byDays[0],
      mostImpactedByDrawdown: byDrawdown[0],
      highestSubStock: bySub[0],
      peakMonth: peakMonthFlow.month,
      peakMonthOutflowB: peakMonthFlow.totalOutflowB,
    };
  }, [params]);
}
