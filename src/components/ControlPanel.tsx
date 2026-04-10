import { IPOS, IPO_MONTHS, type SimParams } from "../types";

interface Props {
  params: SimParams;
  onChange: (params: SimParams) => void;
}

function fmt(val: number, decimals = 2) {
  return `$${val.toFixed(decimals)}T`;
}

function fmtPct(val: number) {
  return `${Math.round(val * 100)}%`;
}

export function ControlPanel({ params, onChange }: Props) {
  const set = (patch: Partial<SimParams>) =>
    onChange({ ...params, ...patch });

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
            const step = Math.round((ipo.maxValuation - ipo.minValuation) / 20 * 100) / 100;
            return (
              <div key={ipo.id}>
                <div className="flex justify-between items-baseline mb-1">
                  <span
                    className="text-sm font-semibold"
                    style={{ color: ipo.color }}
                  >
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
                  step={step || 0.01}
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
                    background: `linear-gradient(to right, ${ipo.color} 0%, ${ipo.color} ${
                      ((val - ipo.minValuation) /
                        (ipo.maxValuation - ipo.minValuation)) *
                      100
                    }%, #e2e8f0 ${
                      ((val - ipo.minValuation) /
                        (ipo.maxValuation - ipo.minValuation)) *
                      100
                    }%, #e2e8f0 100%)`,
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
              <label
                className="text-xs font-medium mb-1 block"
                style={{ color: ipo.color }}
              >
                {ipo.name}
              </label>
              <div className="flex flex-wrap gap-1">
                {IPO_MONTHS.map((m) => (
                  <button
                    key={m}
                    onClick={() =>
                      set({
                        timings: { ...params.timings, [ipo.id]: m },
                      })
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

      {/* Float % and Mag7 Allocation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <div className="flex justify-between items-baseline mb-1">
            <span className="text-sm font-semibold text-[#0f172a]">
              IPO Float
            </span>
            <span className="text-sm font-bold text-[#1f6fdb]">
              {fmtPct(params.floatPct)}
            </span>
          </div>
          <input
            type="range"
            min={0.05}
            max={0.40}
            step={0.01}
            value={params.floatPct}
            onChange={(e) => set({ floatPct: parseFloat(e.target.value) })}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-[#e2e8f0]"
          />
          <div className="flex justify-between text-[10px] text-[#94a3b8] mt-0.5">
            <span>5%</span>
            <span>40%</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-baseline mb-1">
            <span className="text-sm font-semibold text-[#0f172a]">
              Funded by Mag 7 + Oracle selling
            </span>
            <span className="text-sm font-bold text-[#ef4444]">
              {fmtPct(params.mag7Pct)}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={0.80}
            step={0.01}
            value={params.mag7Pct}
            onChange={(e) => set({ mag7Pct: parseFloat(e.target.value) })}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-[#e2e8f0]"
          />
          <div className="flex justify-between text-[10px] text-[#94a3b8] mt-0.5">
            <span>0%</span>
            <span>80%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
