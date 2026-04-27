<script lang="ts">
	import {
		scaleBand,
		scaleLinear,
		line,
		axisBottom,
		axisLeft,
		axisRight,
		select,
		curveMonotoneX,
		timeFormat,
		max
	} from 'd3';
	import type { MonthlyPatientData } from '$lib/data/mock';

	interface Props {
		data: MonthlyPatientData[];
		height?: number;
		barColor?: string;
		lineColor?: string;
		onSelect?: (point: MonthlyPatientData) => void;
		selectedDate?: Date | null;
	}

	let {
		data,
		height = 300,
		barColor = 'var(--color-primary-500)',
		lineColor = 'var(--color-secondary-500)',
		onSelect,
		selectedDate = null
	}: Props = $props();

	const W = 800;
	const margin = { top: 20, right: 64, bottom: 40, left: 56 };
	const innerW = $derived(W - margin.left - margin.right);
	const innerH = $derived(height - margin.top - margin.bottom);

	// X: band scale keyed by ISO date string
	const xScale = $derived(
		scaleBand()
			.domain(data.map((d) => d.date.toISOString()))
			.range([0, innerW])
			.padding(0.35)
	);

	// Left Y: total stays
	const yLeft = $derived(
		scaleLinear()
			.domain([0, (max(data, (d) => d.stays) ?? 0) * 1.25])
			.range([innerH, 0])
			.nice()
	);

	// Right Y: LVC proportion %
	const yRight = $derived(
		scaleLinear()
			.domain([0, (max(data, (d) => d.lvcProportion) ?? 0) * 1.5])
			.range([innerH, 0])
			.nice()
	);

	// Line for LVC proportion, centered on each bar
	const lineGen = $derived(
		line<MonthlyPatientData>()
			.x((d) => (xScale(d.date.toISOString()) ?? 0) + xScale.bandwidth() / 2)
			.y((d) => yRight(d.lvcProportion))
			.curve(curveMonotoneX)
	);

	let xAxisEl = $state<SVGGElement | undefined>(undefined);
	let yLeftEl = $state<SVGGElement | undefined>(undefined);
	let yRightEl = $state<SVGGElement | undefined>(undefined);

	$effect(() => {
		const scale = xScale;
		if (xAxisEl) {
			select(xAxisEl)
				.call(
					axisBottom(scale)
						.tickFormat((d) => timeFormat('%b %y')(new Date(d as string)))
						.tickSize(0)
				)
				.select('.domain')
				.attr('stroke-opacity', '0.2');
			select(xAxisEl).selectAll('.tick text').attr('dy', '1.2em');
		}
	});

	$effect(() => {
		const scale = yLeft;
		if (yLeftEl) {
			select(yLeftEl)
				.call(axisLeft(scale).ticks(5))
				.select('.domain')
				.remove();
			select(yLeftEl).selectAll('.tick line').attr('stroke-opacity', '0.15');
		}
	});

	$effect(() => {
		const scale = yRight;
		if (yRightEl) {
			select(yRightEl)
				.call(
					axisRight(scale)
						.ticks(5)
						.tickFormat((d) => `${(d as number).toFixed(0)}%`)
				)
				.select('.domain')
				.remove();
			// suppress right-axis tick lines (handled by left grid)
			select(yRightEl).selectAll('.tick line').remove();
		}
	});

	function isSelected(point: MonthlyPatientData): boolean {
		return !!selectedDate && point.date.getTime() === selectedDate.getTime();
	}

	let hovered = $state<string | null>(null);
</script>

<div class="w-full">
	<!-- Legend -->
	<div class="flex items-center gap-5 text-xs text-surface-600-400 mb-3">
		<span class="flex items-center gap-1.5">
			<span class="inline-block w-3 h-3 rounded-sm" style="background:{barColor}; opacity:0.65"></span>
			Total stays
		</span>
		<span class="flex items-center gap-1.5">
			<span class="inline-block w-5 h-0.5 rounded-full" style="background:{lineColor}"></span>
			LVC proportion (%)
		</span>
	</div>

	<svg viewBox="0 0 {W} {height}" class="w-full h-auto cursor-pointer" role="img">
		<g transform="translate({margin.left},{margin.top})">
			<!-- Grid lines (left scale) -->
			{#each yLeft.ticks(5) as tick}
				<line
					x1="0" y1={yLeft(tick)}
					x2={innerW} y2={yLeft(tick)}
					stroke="currentColor" stroke-opacity="0.07"
				/>
			{/each}

			<!-- Bars: total stays -->
			{#each data as point}
				{@const bx  = xScale(point.date.toISOString()) ?? 0}
				{@const bw  = xScale.bandwidth()}
				{@const by  = yLeft(point.stays)}
				{@const bh  = innerH - yLeft(point.stays)}
				{@const sel = isSelected(point)}
				{@const hov = hovered === point.date.toISOString()}
				<rect
					x={bx} y={by} width={bw} height={bh}
					fill={barColor}
					opacity={sel ? 1 : hov ? 0.8 : 0.55}
					rx="3"
					class="transition-opacity duration-150 cursor-pointer"
					role="button"
					tabindex="0"
					onmouseenter={() => (hovered = point.date.toISOString())}
					onmouseleave={() => (hovered = null)}
					onclick={() => onSelect?.(point)}
				/>
				<!-- Stay count label on hover/select -->
				{#if sel || hov}
					<text
						x={bx + bw / 2} y={by - 5}
						text-anchor="middle"
						fill={barColor}
						font-size="11" font-weight="700"
					>{point.stays}</text>
				{/if}
			{/each}

			<!-- LVC proportion line -->
			<path
				d={lineGen(data) ?? ''}
				fill="none"
				stroke={lineColor}
				stroke-width="2.5"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>

			<!-- LVC proportion dots -->
			{#each data as point}
				{@const cx  = (xScale(point.date.toISOString()) ?? 0) + xScale.bandwidth() / 2}
				{@const cy  = yRight(point.lvcProportion)}
				{@const sel = isSelected(point)}
				{#if sel}
					<circle cx={cx} cy={cy} r="10" fill="none"
						stroke={lineColor} stroke-width="2" opacity="0.25" />
				{/if}
				<circle
					cx={cx} cy={cy}
					r={sel ? 6 : 3.5}
					fill={sel ? 'white' : lineColor}
					stroke={lineColor}
					stroke-width={sel ? 2.5 : 1.5}
					class="cursor-pointer transition-all"
					onclick={() => onSelect?.(point)}
				/>
				<!-- % label on selected -->
				{#if sel}
					<text
						x={cx} y={cy - 12}
						text-anchor="middle"
						fill={lineColor}
						font-size="11" font-weight="700"
					>{point.lvcProportion.toFixed(1)}%</text>
				{/if}
			{/each}

			<!-- Axes -->
			<g bind:this={xAxisEl} transform="translate(0,{innerH})" class="axis" />
			<g bind:this={yLeftEl} class="axis" />
			<g bind:this={yRightEl} transform="translate({innerW},0)" class="axis axis-right" />
		</g>
	</svg>
</div>

<style>
	svg :global(.axis text) {
		fill: currentColor;
		font-size: 11px;
		opacity: 0.6;
	}
	svg :global(.axis .domain) {
		stroke: currentColor;
		stroke-opacity: 0.15;
	}
	svg :global(.axis .tick line) {
		stroke: currentColor;
		stroke-opacity: 0.1;
	}
	svg :global(.axis-right text) {
		opacity: 0.5;
	}
</style>
