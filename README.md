# LUCID Dashboard

An interactive data visualisation dashboard for exploring Low Value Care (LVC) in hospital patient data. Built as a prototype for **Hospital X**.

## What it does

The dashboard lets clinicians and analysts explore LVC trends across three care categories:

| LVC | Description |
|-----|-------------|
| **LVC 1** | Do not use benzodiazepines or other sedativa-hypnotics in older adults as first choice for insomnia, agitation or delirium |
| **LVC 2** | Do not transfuse more than the minimum number of red blood units necessary |
| **LVC 3** | Do not order blood tests at regular intervals or routine extensive lab panels including X-rays without specific clinical questions |

Each view shows:
- **KPI cards** — total patients, hospital stays, and the LVC proportion trend
- **Monthly stays chart** — stacked bar chart breaking down total stays into LVC and non-LVC, with an absolute/proportion toggle
- **Patient profile** — click any month bar to see age group and sex breakdowns for that cohort

## Tech stack

| Layer | Tool |
|-------|------|
| Framework | SvelteKit 2 + Svelte 5 |
| Language | TypeScript |
| Styling | Tailwind CSS 4 + Skeleton UI 4 |
| Charts | D3.js 7 |
| Package manager | pnpm |

## Getting started

```bash
pnpm install
pnpm dev
```

Then open [http://localhost:5173](http://localhost:5173).

```bash
pnpm build      # production build
pnpm preview    # preview production build
pnpm check      # TypeScript + Svelte diagnostics
```

## Project structure

```
src/
  app.html                     # sets data-theme / data-mode before first paint
  app.css                      # Tailwind + Skeleton + theme imports
  lib/
    data/
      mock.ts                  # all mock data and shared TypeScript interfaces
    components/
      charts/
        StaysChart.svelte      # stacked bar chart with absolute/proportion toggle
        BreakdownChart.svelte  # horizontal proportion bars (CSS, no D3)
      KpiCard.svelte           # metric card with delta indicator
      LightSwitch.svelte       # dark/light mode toggle
      ThemePicker.svelte       # theme selector
    themes/
      lucid.css                # custom Lucid theme
  routes/
    +layout.svelte             # AppBar, LVC tabs, description header
    +page.svelte               # LVC 1 view
    lvc-2/+page.svelte         # LVC 2 view
    lvc-3/+page.svelte         # LVC 3 view
```

## Data

All data is mocked in `src/lib/data/mock.ts`. Each LVC has 12 months of data (May 2025 – April 2026) with per-month breakdowns by age group and sex. To connect real data, implement the same `MonthlyPatientData` interface and swap the imports in each page.

## Theming

The dashboard supports multiple themes (including a custom **Lucid** theme) and full dark/light mode. Both are persisted to `localStorage` and restored before first paint to prevent flash. Use the controls in the top-right corner of the app bar.
