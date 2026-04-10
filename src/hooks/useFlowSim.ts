import { useMemo } from "react";
import {
  IPOS,
  STOCKS,
  IPO_MONTHS,
  type SimParams,
  type SimResult,
  type StockImpact,
  type MonthlyFlow,
  type IpoMonth,
} from "../types";

// Square-root market impact model.
// Calibrated to large-cap empirics: ~1.5% daily vol for Mag7/Oracle names.
// Impact = DAILY_VOL_PCT * sqrt(daysOfVolume)
// This gives: 1 day → 1.5%, 4 days → 3%, 9 days → 4.5%, 16 days → 6%
const DAILY_VOL_PCT = 1.5;

export function useFlowSim(params: SimParams): SimResult {
  return useMemo(() => {
    const { valuations, timings, floatPct, mag7Pct } = params;

    // Step 1: compute float $ per IPO and total outflow from Mag7/Oracle
    const totalFloatB = IPOS.reduce((sum, ipo) => {
      const valT = valuations[ipo.id] ?? ipo.defaultValuation;
      return sum + valT * 1000 * floatPct; // convert T→B
    }, 0);

    const totalOutflowB = totalFloatB * mag7Pct;

    // Step 2: allocate outflow to each stock proportional to market cap
    const totalMktCap = STOCKS.reduce((s, st) => s + st.marketCap, 0);

    const stockImpacts: StockImpact[] = STOCKS.map((stock) => {
      const outflowB = totalOutflowB * (stock.marketCap / totalMktCap);
      const daysOfVolume = outflowB / stock.adv;
      const drawdownPct = DAILY_VOL_PCT * Math.sqrt(daysOfVolume);

      return {
        ticker: stock.ticker,
        name: stock.name,
        color: stock.color,
        outflowB,
        daysOfVolume,
        drawdownPct,
      };
    });

    // Step 3: monthly flow breakdown
    const monthTotals: Partial<Record<IpoMonth, number>> = {};
    for (const ipo of IPOS) {
      const valT = valuations[ipo.id] ?? ipo.defaultValuation;
      const floatB = valT * 1000 * floatPct;
      const outflow = floatB * mag7Pct;
      const month = timings[ipo.id];
      monthTotals[month] = (monthTotals[month] ?? 0) + outflow;
    }

    const monthlyFlows: MonthlyFlow[] = IPO_MONTHS.map((month) => ({
      month,
      totalOutflowB: monthTotals[month] ?? 0,
    }));

    // Step 4: derived highlights
    const sortedByDays = [...stockImpacts].sort(
      (a, b) => b.daysOfVolume - a.daysOfVolume
    );
    const sortedByDrawdown = [...stockImpacts].sort(
      (a, b) => b.drawdownPct - a.drawdownPct
    );

    const peakMonthFlow = monthlyFlows.reduce((best, m) =>
      m.totalOutflowB > best.totalOutflowB ? m : best
    );

    return {
      totalFloatB,
      totalOutflowB,
      stockImpacts,
      monthlyFlows,
      mostImpactedByDays: sortedByDays[0],
      mostImpactedByDrawdown: sortedByDrawdown[0],
      peakMonth: peakMonthFlow.month,
      peakMonthOutflowB: peakMonthFlow.totalOutflowB,
    };
  }, [params]);
}
