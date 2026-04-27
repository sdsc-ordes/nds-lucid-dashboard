<script lang="ts">
	import {
		scaleTime,
		scaleLinear,
		line,
		area,
		extent,
		axisBottom,
		axisLeft,
		select,
		curveMonotoneX,
		timeFormat,
		max
	} from 'd3';
	import type { TimeSeriesPoint } from '$lib/data/mock';

	interface Props {
		data: TimeSeriesPoint[];
		title?: string;
		color?: string;
		height?: number;
		formatY?: (v: number) => string;
		onSelect?: (point: TimeSeriesPoint) => void;
		selectedDate?: Date | null;
	}

	let {
		data,
		title = '',
		color = 'var(--color-primary-500)',
		height = 280,
		formatY = (v) => `${(v / 1000).toFixed(0)}k`,
		onSelect,
		selectedDate = null
	}: Props = $props();

	const W = 800;
	const margin = { top: 16, right: 16, bottom: 40, left: 56 };
	const innerW = $derived(W - margin.left - margin.right);
	const innerH = $derived(height - margin.top - margin.bottom);

	const xScale = $derived(
		scaleTime()
			.domain(extent(data, (d) => d.date) as [Date, Date])
			.range([0, innerW])
	);

	const yScale = $derived(
		scaleLinear()
			.domain([0, (max(data, (d) => d.value) ?? 0) * 1.15])
			.range([innerH, 0])
			.nice()
	);

	const lineGen = $derived(
		line<TimeSeriesPoint>()
			.x((d) => xScale(d.date))
			.y((d) => yScale(d.value))
			.curve(curveMonotoneX)
	);

	const areaGen = $derived(
		area<TimeSeriesPoint>()
			.x((d) => xScale(d.date))
			.y0(innerH)
			.y1((d) => yScale(d.value))
			.curve(curveMonotoneX)
	);

	let xAxisEl = $state<SVGGElement | undefined>(undefined);
	let yAxisEl = $state<SVGGElement | undefined>(undefined);

	$effect(() => {
		const scale = xScale;
		if (xAxisEl) {
			select(xAxisEl)
				.call(
					axisBottom(scale)
						.ticks(6)
						.tickFormat(timeFormat('%b %y') as (d: Date | { valueOf(): number }) => string)
				)
				.select('.domain')
				.attr('stroke-opacity', '0.2');
			select(xAxisEl).selectAll('.tick line').attr('stroke-opacity', '0.2');
		}
	});

	$effect(() => {
		const scale = yScale;
		const fmt = formatY;
		if (yAxisEl) {
			select(yAxisEl)
				.call(
					axisLeft(scale)
						.ticks(5)
						.tickFormat((d) => fmt(d as number))
				)
				.select('.domain')
				.remove();
			select(yAxisEl).selectAll('.tick line').attr('stroke-opacity', '0.15');
		}
	});

	let tooltip = $state<{ x: number; y: number; point: TimeSeriesPoint } | null>(null);

	function isSelected(point: TimeSeriesPoint): boolean {
		return !!selectedDate && point.date.getTime() === selectedDate.getTime();
	}

	function onMouseMove(event: MouseEvent) {
		const svgEl = (event.currentTarget as SVGSVGElement).getBoundingClientRect();
		const mx = ((event.clientX - svgEl.left) / svgEl.width) * W - margin.left;
		const date = xScale.invert(mx);
		let nearest = data[0];
		let minDist = Infinity;
		for (const p of data) {
			const dist = Math.abs(p.date.getTime() - date.getTime());
			if (dist < minDist) { minDist = dist; nearest = p; }
		}
		tooltip = {
			x: xScale(nearest.date) + margin.left,
			y: yScale(nearest.value) + margin.top,
			point: nearest
		};
	}

	function onMouseLeave() {
		tooltip = null;
	}

	function onClick(event: MouseEvent) {
		const svgEl = (event.currentTarget as SVGSVGElement).getBoundingClientRect();
		const mx = ((event.clientX - svgEl.left) / svgEl.width) * W - margin.left;
		const date = xScale.invert(mx);
		let nearest = data[0];
		let minDist = Infinity;
		for (const p of data) {
			const dist = Math.abs(p.date.getTime() - date.getTime());
			if (dist < minDist) { minDist = dist; nearest = p; }
		}
		onSelect?.(nearest);
	}
</script>

<div class="w-full">
	{#if title}
		<h3 class="text-base font-semibold mb-3 text-surface-900-50">{title}</h3>
	{/if}
	<svg
		viewBox="0 0 {W} {height}"
		class="w-full h-auto cursor-pointer"
		role="img"
		onmousemove={onMouseMove}
		onmouseleave={onMouseLeave}
		onclick={onClick}
	>
		<defs>
			<linearGradient id="area-gradient-lc" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0%" stop-color={color} stop-opacity="0.25" />
				<stop offset="100%" stop-color={color} stop-opacity="0" />
			</linearGradient>
		</defs>

		<g transform="translate({margin.left},{margin.top})">
			<!-- Grid lines -->
			{#each yScale.ticks(5) as tick}
				<line
					x1="0" y1={yScale(tick)}
					x2={innerW} y2={yScale(tick)}
					stroke="currentColor" stroke-opacity="0.08"
				/>
			{/each}

			<!-- Area fill -->
			<path d={areaGen(data) ?? ''} fill="url(#area-gradient-lc)" />

			<!-- Line -->
			<path
				d={lineGen(data) ?? ''}
				fill="none"
				stroke={color}
				stroke-width="2.5"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>

			<!-- Selected dot vertical guide -->
			{#each data as point}
				{#if isSelected(point)}
					<line
						x1={xScale(point.date)} y1="0"
						x2={xScale(point.date)} y2={innerH}
						stroke={color} stroke-opacity="0.2" stroke-dasharray="4 3"
					/>
				{/if}
			{/each}

			<!-- Dots -->
			{#each data as point}
				{@const sel = isSelected(point)}
				{@const hov = tooltip?.point === point}
				<!-- Outer ring for selected -->
				{#if sel}
					<circle
						cx={xScale(point.date)} cy={yScale(point.value)}
						r="11"
						fill="none"
						stroke={color}
						stroke-width="2"
						opacity="0.3"
					/>
				{/if}
				<circle
					cx={xScale(point.date)}
					cy={yScale(point.value)}
					r={sel ? 6 : hov ? 5 : 3.5}
					fill={sel ? 'white' : color}
					stroke={color}
					stroke-width={sel ? 2.5 : 1.5}
					class="transition-all"
				/>
			{/each}

			<!-- Axes -->
			<g bind:this={xAxisEl} transform="translate(0,{innerH})" class="axis" />
			<g bind:this={yAxisEl} class="axis" />

			<!-- Hover tooltip -->
			{#if tooltip && !isSelected(tooltip.point)}
				<rect
					x={tooltip.x - margin.left - 40}
					y={tooltip.y - margin.top - 28}
					width="80" height="22" rx="4"
					fill={color} opacity="0.9"
				/>
				<text
					x={tooltip.x - margin.left}
					y={tooltip.y - margin.top - 13}
					text-anchor="middle"
					fill="white" font-size="11" font-weight="600"
				>
					{formatY(tooltip.point.value)}
				</text>
			{/if}
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
</style>
