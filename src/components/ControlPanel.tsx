import { IPOS, IPO_MONTHS, STOCKS, type SimParams } from "../types";

interface Props {
  params: SimParams;
  onChange: (params: SimParams) => void;
}

function fmt(val: number) {
  return `$${val.toFixed(2)}T`;
}

function fmtPct(val: number) {
  return `${Math.round(val * 100)}%`;
}

function SliderRow({
  label,
  sublabel,
  value,
  min,
  max,
  step,
  displayValue,
  valueColor,
  onChange,
}: {
  label: string;
  sublabel?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  displayValue: string;
  valueColor?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex justify-between items-baseline mb-1">
        <div>
          <span className="text-sm font-semibold text-[#0f172a]">{label}</span>
          {sublabel && (
            <span className="text-xs text-[#94a3b8] ml-2">{sublabel}</span>
          )}
        </div>
        <span
          className="text-sm font-bold"
          style={{ color: valueColor ?? "#0f172a" }}
        >
          {displayValue}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-[#e2e8f0]"
      />
      <div className="flex justify-between text-[10px] text-[#94a3b8] mt-0.5">
        <span>Low</span>
        <span>High</span>
      </div>
    </div>
  );
}

export function ControlPanel({ params, onChange }: Props) {
  const set = (patch: Partial<SimParams>) => onChange({ ...params, ...patch });

  return (
    <div className="bg-white border border-[#d9e1ea] rounded-xl p-5 space-y-6">

      {/* IPO Valuations */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-[#64748b] mb-4">
          IPO Valuations
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {IPOS.map((ipo) => {
            const val = params.valuations[ipo.id] ?? ipo.defaultValuation;
            const pct =
              (val - ipo.minValuation) / (ipo.maxValuation - ipo.minValuation);
            return (
              <div key={ipo.id}>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-sm font-semibold" style={{ color: ipo.color }}>
                    {ipo.name}
                  </span>
                  <span className="text-sm font-bold text-[#0f172a]">
                    {fmt(val)}
                  </span>
                </div>
                <input
                  type="range"
                  min={ipo.minValuation}
                  max={ipo.maxValuation}
                  step={0.01}
                  value={val}
                  onChange={(e) =>
                    set({
                      valuations: {
                        ...params.valuations,
                        [ipo.id]: parseFloat(e.target.value),
                      },
                    })
                  }
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, ${ipo.color} 0%, ${ipo.color} ${pct * 100}%, #e2e8f0 ${pct * 100}%, #e2e8f0 100%)`,
                  }}
                />
                <div className="flex justify-between text-[10px] text-[#94a3b8] mt-0.5">
                  <span>{fmt(ipo.minValuation)}</span>
                  <span>{fmt(ipo.maxValuation)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* IPO Timing */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-[#64748b] mb-4">
          IPO Timing (H2 2026)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {IPOS.map((ipo) => (
            <div key={ipo.id}>
              <label className="text-xs font-medium mb-1 block" style={{ color: ipo.color }}>
                {ipo.name}
              </label>
              <div className="flex flex-wrap gap-1">
                {IPO_MONTHS.map((m) => (
                  <button
                    key={m}
                    onClick={() =>
                      set({ timings: { ...params.timings, [ipo.id]: m } })
                    }
                    className={`text-[11px] px-2 py-0.5 rounded border font-medium transition-colors ${
                      params.timings[ipo.id] === m
                        ? "text-white border-transparent"
                        : "text-[#64748b] border-[#d9e1ea] hover:border-[#94a3b8]"
                    }`}
                    style={
                      params.timings[ipo.id] === m
                        ? { backgroundColor: ipo.color, borderColor: ipo.color }
                        : {}
                    }
                  >
                    {m.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pressure Assumptions */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-[#64748b] mb-4">
          Pressure Assumptions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <SliderRow
            label="IPO float"
            sublabel="share offered at listing"
            value={params.floatPct}
            min={0.05}
            max={0.40}
            step={0.01}
            displayValue={fmtPct(params.floatPct)}
            valueColor="#0f172a"
            onChange={(v) => set({ floatPct: v })}
          />
          <SliderRow
            label="Mechanical pressure"
            sublabel="index rebalancing"
            value={params.mechIntensity}
            min={0}
            max={1}
            step={0.01}
            displayValue={fmtPct(params.mechIntensity)}
            valueColor="#1f6fdb"
            onChange={(v) => set({ mechIntensity: v })}
          />
          <SliderRow
            label="Substitution intensity"
            sublabel="proxy-premium compression"
            value={params.subIntensity}
            min={0}
            max={1}
            step={0.01}
            displayValue={fmtPct(params.subIntensity)}
            valueColor="#ef4444"
            onChange={(v) => set({ subIntensity: v })}
          />
        </div>
        <p className="text-[11px] text-[#94a3b8] mt-3">
          Float scales mechanical pressure proportionally (more shares = more index weight = more rebalancing).
          Float does not affect substitution — re-rating occurs because the IPO exists, not because of float size.
          Mechanical and substitution intensity: Low = range floor, High = ceiling, 50% = midpoint.
        </p>
      </div>

      {/* Stock exclusions */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-[#64748b] mb-3">
          Include in Selling Pressure
        </h3>
        <div className="flex flex-wrap gap-2">
          {STOCKS.map((stock) => {
            const excluded = params.excludedTickers.includes(stock.ticker);
            return (
              <button
                key={stock.ticker}
                onClick={() => {
                  const next = excluded
                    ? params.excludedTickers.filter((t) => t !== stock.ticker)
                    : [...params.excludedTickers, stock.ticker];
                  set({ excludedTickers: next });
                }}
                className={`text-xs px-3 py-1 rounded-full border font-medium transition-colors ${
                  excluded
                    ? "text-[#94a3b8] border-[#e2e8f0] bg-white line-through"
                    : "text-white border-transparent"
                }`}
                style={
                  excluded ? {} : { backgroundColor: stock.color }
                }
              >
                {stock.ticker}
              </button>
            );
          })}
        </div>
        <p className="text-[11px] text-[#94a3b8] mt-2">
          Deselect names whose holders are assumed not to participate in rotation.
          Total pressure decreases — outflow is not redistributed.
        </p>
      </div>

    </div>
  );
}
