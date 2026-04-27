# Lucid Dashboard — Development Guide

## Tech Stack

| Layer | Tool | Version |
|---|---|---|
| Framework | SvelteKit | ^2.0 |
| Language | Svelte + TypeScript | ^5.0 |
| Styling | Tailwind CSS | ^4.0 |
| UI Components | Skeleton UI | ^4.0 |
| Charts | D3.js | ^7.0 |
| Package manager | pnpm | — |

## Commands

```bash
pnpm dev          # start dev server (http://localhost:5173)
pnpm build        # production build
pnpm preview      # preview production build
pnpm check        # TypeScript + Svelte diagnostics
```

## Project Structure

```
src/
  app.html                        # sets data-theme / data-mode via inline script
  app.css                         # Tailwind + Skeleton + theme imports
  lib/
    data/
      mock.ts                     # all mock data + shared TypeScript interfaces
    components/
      charts/
        LineChart.svelte           # D3 time-series line chart
        BarChart.svelte            # D3 categorical bar chart
      KpiCard.svelte               # metric card with delta indicator
      LightSwitch.svelte           # dark/light toggle (persists to localStorage)
      ThemePicker.svelte           # theme <select> (persists to localStorage)
    themes/
      lucid.css                    # custom Lucid theme (primary theme for this project)
  routes/
    +layout.svelte                 # imports app.css
    +page.svelte                   # main dashboard page
```

## Svelte 5 Rules

Always use **runes**. Never use the Options API.

| Old (forbidden) | New (required) |
|---|---|
| `export let x` | `let { x } = $props()` |
| `let x = 0` (reactive) | `let x = $state(0)` |
| `$: y = x * 2` | `const y = $derived(x * 2)` |
| `onMount(() => ...)` | `$effect(() => ...)` |
| `<slot />` | `{@render children()}` |

`bind:this` targets must be typed and declared as `$state`:
```ts
let el = $state<SVGGElement | undefined>(undefined);
```

## Styling — Skeleton Presets for Everything

**Every design element must use Skeleton presets and tokens as the first choice.** Only reach for raw Tailwind utilities when no Skeleton equivalent exists (e.g. `flex`, `gap-4`, `w-full`). Never use Tailwind color utilities (`bg-gray-*`, `text-indigo-*`, `border-gray-*`) — always use Skeleton tokens.

**Colors**
```html
<!-- correct -->
<div class="bg-surface-100-900 text-primary-500 border-surface-300-700">

<!-- forbidden -->
<div class="bg-gray-100 text-indigo-500 border-gray-300">
```

The `-100-900` suffix pattern renders `100` in light mode and `900` in dark mode automatically.

**Presets** — use these for all filled/tonal/outlined UI elements:
```html
<div class="preset-filled-surface-100-900">   <!-- solid fill -->
<div class="preset-tonal-primary">            <!-- muted fill -->
<div class="preset-outlined-primary-500">    <!-- border only -->
```

**Buttons** — always `btn` + a preset, never custom background classes:
```html
<button class="btn preset-filled-primary-500">Primary action</button>
<button class="btn btn-sm preset-tonal-surface">Secondary</button>
<button class="btn preset-outlined-primary-500">Outlined</button>
```

**Cards** — always `card` + a filled/tonal preset:
```html
<div class="card preset-filled-surface-100-900 p-6">...</div>
```

**Form controls** — use Skeleton's `select`, `input`, `textarea` base classes + a preset:
```html
<select class="select preset-tonal-surface">...</select>
<input class="input preset-tonal-surface" />
```

**Badges / chips**
```html
<span class="badge preset-filled-primary-500">New</span>
<span class="badge preset-tonal-warning">Pending</span>
```

**Radius** — The Lucid theme sets `--radius-base: 9999rem` (pills) and `--radius-container: 0.375rem`. Use `rounded-base` for interactive elements, `rounded-container` for cards/panels.

**SVG attributes support CSS variables** — use Skeleton tokens even in D3 charts:
```html
<path stroke="var(--color-primary-500)" />
<rect fill="var(--color-secondary-500)" />
```
Only fall back to hardcoded hex values if a specific shade not covered by a theme token is needed.

## Lucid Theme Palette

The default/custom theme lives in `src/lib/themes/lucid.css`. Its brand colors:

| Token | Hue | Character |
|---|---|---|
| `primary` | Blue (~255°) | Main brand, CTAs |
| `secondary` | Yellow-warm (~70°) | Highlights, badges |
| `tertiary` | Orange-red (~27°) | Alerts, accents |
| `success` | Green (~147°) | Positive deltas |
| `error` | Red-orange (~30°) | Negative deltas |
| `surface` | Cool grey-blue | Backgrounds, borders |

Fonts: **Avenir/Montserrat** (body), **Seravek/Gill Sans** (headings).

## Theme & Dark Mode System

- Theme is stored in `localStorage.theme`, applied via `data-theme` on `<html>`
- Mode is stored in `localStorage.mode`, applied via `data-mode` on `<html>`
- The inline `<script>` in `app.html` restores both before first paint (prevents flash)
- Tailwind's `dark:` variant is wired to `[data-mode="dark"]` via `@custom-variant` in `app.css`
- To add a new theme: import it in `app.css`, add to the `themes` array in `ThemePicker.svelte`

## D3 + Svelte Pattern

**D3 = math only. Svelte = DOM.**

```svelte
<script lang="ts">
  import { scaleLinear, axisLeft, select } from 'd3';

  let { data } = $props();

  // D3 computes — Svelte renders
  const yScale = $derived(scaleLinear().domain([0, 100]).range([300, 0]));

  // Axis injection via bind:this + $effect
  let yAxisEl = $state<SVGGElement | undefined>(undefined);
  $effect(() => {
    const scale = yScale;           // read derived inside effect to track it
    if (yAxisEl) select(yAxisEl).call(axisLeft(scale));
  });
</script>

<!-- Svelte renders the SVG structure -->
{#each data as d}
  <circle cx={xScale(d.x)} cy={yScale(d.y)} r="4" />
{/each}
<g bind:this={yAxisEl} />
```

Never use D3's `.append()`, `.enter()`, or `.exit()` — let Svelte handle DOM mutations.

**Chart responsiveness:** all charts use `viewBox` + `class="w-full h-auto"` so they scale with their container. The internal coordinate system is fixed (`W=800` for line, `W=560` for bar).

**Chart color prop:** pass a Skeleton CSS variable string. This works in SVG presentation attributes in all modern browsers and automatically responds to theme switching:
```ts
color="var(--color-primary-500)"    // line chart default
color="var(--color-secondary-500)"  // bar chart default
color="var(--color-tertiary-500)"   // users / alternate series
```

## Mock Data (`src/lib/data/mock.ts`)

Exported shapes:
```ts
TimeSeriesPoint  { date: Date; value: number }
CategoryPoint    { label: string; value: number }
KpiMetric        { title; value; unit; change; subtitle }
```

Exported datasets:
- `revenueTimeSeries` — 12 months of monthly revenue
- `usersTimeSeries` — 12 months of monthly active users
- `segmentRevenue` — revenue broken down by customer segment
- `kpis` — four KPI card metrics

When adding new data, keep it in `mock.ts` and export typed arrays. Real data sources can be swapped in by matching the same interfaces.

## Adding New Chart Components

1. Create `src/lib/components/charts/MyChart.svelte`
2. Accept `data`, `color`, `height`, `formatY` as props (match existing chart API for consistency)
3. Use a fixed `viewBox` width, `$derived` for scales, `$effect` + `bind:this` for axes
4. Add a scoped `<style>` block targeting `svg :global(.axis text/line/.domain)`
5. Import and use in `+page.svelte`
