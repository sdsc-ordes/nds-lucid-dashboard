<script lang="ts">
	import { scaleBand, scaleLinear, axisBottom, axisLeft, select, timeFormat, max } from 'd3';
	import type { MonthlyPatientData } from '$lib/data/mock';

	interface Props {
		data: MonthlyPatientData[];
		height?: number;
		staysColor?: string;
		lvcColor?: string;
		onSelect?: (point: MonthlyPatientData) => void;
		selectedDate?: Date | null;
	}

	let {
		data,
		height = 300,
		staysColor = 'var(--color-primary-500)',
		lvcColor = 'var(--color-secondary-500)',
		onSelect,
		selectedDate = null
	}: Props = $props();

	type Mode = 'absolute' | 'proportion';
	let mode = $state<Mode>('absolute');

	const W = 800;
	const margin = { top: 24, right: 16, bottom: 40, left: 56 };
	const innerW = $derived(W - margin.left - margin.right);
	const innerH = $derived(height - margin.top - margin.bottom);

	const xScale = $derived(
		scaleBand()
			.domain(data.map((d) => d.date.toISOString()))
			.range([0, innerW])
			.padding(0.25)
	);

	const yAbsScale = $derived(
		scaleLinear()
			.domain([0, (max(data, (d) => d.stays) ?? 0) * 1.2])
			.range([innerH, 0])
			.nice()
	);

	const yPropScale = $derived(
		scaleLinear().domain([0, 100]).range([innerH, 0])
	);

	// LVC at bottom, non-LVC stacked on top
	function segments(point: MonthlyPatientData) {
		const bx = xScale(point.date.toISOString()) ?? 0;
		const bw = xScale.bandwidth();
		if (mode === 'absolute') {
			const lvcTop    = yAbsScale(point.lvcCount);
			const totalTop  = yAbsScale(point.stays);
			return {
				bx, bw,
				lvc:    { y: lvcTop,   h: innerH - lvcTop },
				nonLvc: { y: totalTop, h: lvcTop - totalTop },
				labelY: totalTop - 7
			};
		} else {
			const lvcH = (point.lvcProportion / 100) * innerH;
			return {
				bx, bw,
				lvc:    { y: innerH - lvcH, h: lvcH },
				nonLvc: { y: 0,             h: innerH - lvcH },
				labelY: -7
			};
		}
	}

	let xAxisEl = $state<SVGGElement | undefined>(undefined);
	let yAxisEl = $state<SVGGElement | undefined>(undefined);

	$effect(() => {
		const scale = xScale;
		if (xAxisEl) {
			select(xAxisEl)
				.call(
					axisBottom(scale)
						.tickFormat((d) => timeFormat('%b %y')(new Date(d as string)))
						.tickSize(0)
				)
				.select('.domain').attr('stroke-opacity', '0.3');
			select(xAxisEl).selectAll('.tick text').attr('dy', '1.2em');
		}
	});

	$effect(() => {
		const absScale  = yAbsScale;
		const propScale = yPropScale;
		const m = mode;
		if (yAxisEl) {
			if (m === 'absolute') {
				select(yAxisEl).call(axisLeft(absScale).ticks(5));
			} else {
				select(yAxisEl).call(
					axisLeft(propScale).ticks(5).tickFormat((d) => `${d}%`)
				);
			}
			select(yAxisEl).select('.domain').remove();
			select(yAxisEl).selectAll('.tick line').attr('stroke-opacity', '0.2');
		}
	});

	function isSelected(point: MonthlyPatientData): boolean {
		return !!selectedDate && point.date.getTime() === selectedDate.getTime();
	}

	let hovered = $state<string | null>(null);

	const gridTicks = $derived(
		mode === 'absolute' ? yAbsScale.ticks(5) : yPropScale.ticks(5)
	);

	function gridY(tick: number): number {
		return mode === 'absolute' ? yAbsScale(tick) : yPropScale(tick);
	}
</script>

<div class="w-full">
	<!-- Header: legend + toggle -->
	<div class="flex items-center justify-between mb-4 flex-wrap gap-3">
		<div class="flex items-center gap-5 text-xs text-surface-600-400">
			<span class="flex items-center gap-1.5">
				<span class="inline-block w-3 h-3" style="background:{lvcColor}"></span>
				LVC stays
			</span>
			<span class="flex items-center gap-1.5">
				<span class="inline-block w-3 h-3" style="background:{staysColor}; opacity:0.55"></span>
				Non-LVC stays
			</span>
		</div>
		<div class="flex gap-2">
			<button
				class="btn btn-sm {mode === 'absolute' ? 'preset-filled-primary-500' : 'preset-tonal-surface'}"
				onclick={() => (mode = 'absolute')}
			>
				Absolute
			</button>
			<button
				class="btn btn-sm {mode === 'proportion' ? 'preset-filled-primary-500' : 'preset-tonal-surface'}"
				onclick={() => (mode = 'proportion')}
			>
				Proportion
			</button>
		</div>
	</div>

	<svg viewBox="0 0 {W} {height}" class="w-full h-auto cursor-pointer" role="img">
		<g transform="translate({margin.left},{margin.top})">

			<!-- Horizontal grid lines -->
			{#each gridTicks as tick}
				<line
					x1="0" y1={gridY(tick)}
					x2={innerW} y2={gridY(tick)}
					stroke="currentColor" stroke-opacity="0.08"
				/>
			{/each}

			<!-- Stacked bars: LVC bottom, non-LVC top -->
			{#each data as point}
				{@const seg = segments(point)}
				{@const sel = isSelected(point)}
				{@const hov = hovered === point.date.toISOString()}
				{@const dim = !sel && !hov && hovered !== null}

				<!-- Column highlight for selected -->
				{#if sel}
					<rect
						x={seg.bx - 4} y={0}
						width={seg.bw + 8} height={innerH}
						fill="currentColor" opacity="0.04"
					/>
				{/if}

				<!-- LVC segment (bottom) -->
				<rect
					x={seg.bx} y={seg.lvc.y}
					width={seg.bw} height={seg.lvc.h + 1}
					fill={lvcColor}
					opacity={dim ? 0.25 : 1}
					rx="0"
					class="cursor-pointer transition-opacity duration-150"
					onmouseenter={() => (hovered = point.date.toISOString())}
					onmouseleave={() => (hovered = null)}
					onclick={() => onSelect?.(point)}
				/>

				<!-- Non-LVC segment (top) -->
				<rect
					x={seg.bx} y={seg.nonLvc.y}
					width={seg.bw} height={seg.nonLvc.h}
					fill={staysColor}
					opacity={dim ? 0.25 : sel ? 0.75 : 0.5}
					rx="0"
					class="cursor-pointer transition-opacity duration-150"
					onmouseenter={() => (hovered = point.date.toISOString())}
					onmouseleave={() => (hovered = null)}
					onclick={() => onSelect?.(point)}
				/>

				<!-- Selected: thin top border line -->
				{#if sel}
					<line
						x1={seg.bx} y1={seg.nonLvc.y}
						x2={seg.bx + seg.bw} y2={seg.nonLvc.y}
						stroke={staysColor} stroke-width="2.5"
					/>
				{/if}

				<!-- Label above bar on hover or select -->
				{#if sel || hov}
					<text
						x={seg.bx + seg.bw / 2}
						y={seg.labelY}
						text-anchor="middle"
						font-size="10" font-weight="600"
						fill="currentColor"
						opacity="0.75"
					>
						{mode === 'absolute'
							? `${point.lvcCount} / ${point.stays}`
							: `${point.lvcProportion.toFixed(1)}%`}
					</text>
				{/if}

				<!-- Downward arrow below x-axis for selected column -->
				{#if sel}
					<text
						x={seg.bx + seg.bw / 2}
						y={innerH + 33}
						text-anchor="middle"
						font-size="9"
						fill={staysColor}
						opacity="0.7"
					>▼</text>
				{/if}
			{/each}

			<!-- Axes -->
			<g bind:this={xAxisEl} transform="translate(0,{innerH})" class="axis" />
			<g bind:this={yAxisEl} class="axis" />
		</g>
	</svg>
</div>

<style>
	svg :global(.axis text) {
		fill: currentColor;
		font-size: 11px;
		opacity: 0.55;
	}
	svg :global(.axis .domain) {
		stroke: currentColor;
		stroke-opacity: 0.25;
	}
	svg :global(.axis .tick line) {
		stroke: currentColor;
		stroke-opacity: 0.15;
	}
</style>
