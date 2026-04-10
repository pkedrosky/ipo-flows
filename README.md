# IPO Flows

IPO Flow Impact Simulator for modeling how large 2026 IPOs may pressure proxy AI/mega-cap names via:

- mechanical flow (index/rebalance pressure)
- substitution flow (proxy-premium compression / re-rating)

The app is designed for publication at `/tools/ipo-flows/` with the frontend bundle served from `/tools/ipo-flows/app/` behind Ghost paid-member gating.

## What It Does

The simulator lets readers adjust:

- IPO valuation assumptions for SpaceX, OpenAI, Anthropic
- IPO month for each listing (Jul-Dec 2026)
- float assumption (5%-40%)

It then computes per-stock pressure for the covered universe (Mag 7 + AVGO), and displays:

- days of selling pressure (`total estimated outflow / ADV`)
- implied drawdown floor (`1.5% * sqrt(days)`)
- narrative insights on concentration, substitution risk, and timing stack effects

## Model Summary

Implementation is in [`src/hooks/useFlowSim.ts`](/Users/pk/dev/ipo-flows/src/hooks/useFlowSim.ts).

- Inputs: valuations, timing, float pct
- Baseline valuation calibration: `$3.75T`
- Baseline float calibration: `15%`
- Mechanical channel scales with valuation and float
- Substitution channel is fixed by stock range midpoint (does not scale with float)
- Drawdown uses a square-root impact approximation (Almgren-Chriss style)

Core definitions live in [`src/types/index.ts`](/Users/pk/dev/ipo-flows/src/types/index.ts).

## URL Contract

State is encoded in query params so scenarios are link-shareable.

Examples:

- `?spacex=2.00&openai=0.75&anthropic=1.00`
- `&t_spacex=Jul%202026&t_openai=Sep%202026&t_anthropic=Nov%202026`
- `&float=0.15`

Parsing and URL sync are implemented in [`src/App.tsx`](/Users/pk/dev/ipo-flows/src/App.tsx).

## Local Development

Requirements:

- Node.js 20+

Install and run:

```bash
npm ci
npm run dev
```

Build for production:

```bash
npm run build
```

Preview built output:

```bash
npm run preview
```

## Production Layout

- App shell route: `/tools/ipo-flows/` (Ghost template)
- Frontend bundle route: `/tools/ipo-flows/app/` (nginx `alias` to `dist/`)
- Data route: `/tools/ipo-flows/data/` (not used in this app)

Ops assets:

- Ghost template: [`ops/ghost/ipo-flows.hbs`](/Users/pk/dev/ipo-flows/ops/ghost/ipo-flows.hbs)
- Ghost routes snippet: [`ops/ghost/routes-snippet.yaml`](/Users/pk/dev/ipo-flows/ops/ghost/routes-snippet.yaml)
- nginx include: [`ops/nginx/44-tools-ipo-flows.conf`](/Users/pk/dev/ipo-flows/ops/nginx/44-tools-ipo-flows.conf)
- deploy runbook: [`ops/DEPLOY.md`](/Users/pk/dev/ipo-flows/ops/DEPLOY.md)

## Caveats

This is a directional scenario simulator, not a forecasting or execution model.

- Outputs are sensitive to fixed range assumptions.
- Substitution effects are inherently uncertain and can dominate realized outcomes.
- Drawdown values should be treated as floor estimates.
