<script lang="ts">
	import { scaleBand, scaleLinear, axisBottom, axisLeft, select, max } from 'd3';
	import type { CategoryPoint } from '$lib/data/mock';

	interface Props {
		data: CategoryPoint[];
		title?: string;
		color?: string;
		height?: number;
		formatY?: (v: number) => string;
	}

	let {
		data,
		title = '',
		color = 'var(--color-secondary-500)',
		height = 280,
		formatY = (v) => `${(v / 1000).toFixed(0)}k`
	}: Props = $props();

	const W = 560;
	const margin = { top: 16, right: 16, bottom: 48, left: 56 };
	const innerW = $derived(W - margin.left - margin.right);
	const innerH = $derived(height - margin.top - margin.bottom);

	const xScale = $derived(
		scaleBand()
			.domain(data.map((d) => d.label))
			.range([0, innerW])
			.padding(0.3)
	);

	const yScale = $derived(
		scaleLinear()
			.domain([0, (max(data, (d) => d.value) ?? 0) * 1.15])
			.range([innerH, 0])
			.nice()
	);

	let xAxisEl = $state<SVGGElement | undefined>(undefined);
	let yAxisEl = $state<SVGGElement | undefined>(undefined);

	$effect(() => {
		const scale = xScale;
		if (xAxisEl) {
			select(xAxisEl)
				.call(axisBottom(scale).tickSize(0))
				.select('.domain')
				.attr('stroke-opacity', '0.2');
			select(xAxisEl).selectAll('.tick text').attr('dy', '1.2em');
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

	let hovered = $state<string | null>(null);
</script>

<div class="w-full">
	{#if title}
		<h3 class="text-base font-semibold mb-3 text-surface-900-50">{title}</h3>
	{/if}
	<svg viewBox="0 0 {W} {height}" class="w-full h-auto" role="img">
		<g transform="translate({margin.left},{margin.top})">
			<!-- Horizontal grid lines -->
			{#each yScale.ticks(5) as tick}
				<line
					x1="0"
					y1={yScale(tick)}
					x2={innerW}
					y2={yScale(tick)}
					stroke="currentColor"
					stroke-opacity="0.08"
				/>
			{/each}

			<!-- Bars -->
			{#each data as bar}
				{@const bx = xScale(bar.label) ?? 0}
				{@const bw = xScale.bandwidth()}
				{@const by = yScale(bar.value)}
				{@const bh = innerH - yScale(bar.value)}
				<rect
					x={bx}
					y={by}
					width={bw}
					height={bh}
					fill={color}
					opacity={hovered === null || hovered === bar.label ? 1 : 0.35}
					rx="4"
					class="cursor-pointer transition-opacity duration-150"
					role="button"
					tabindex="0"
					onmouseenter={() => (hovered = bar.label)}
					onmouseleave={() => (hovered = null)}
				/>
				<!-- Value label on hover -->
				{#if hovered === bar.label}
					<text
						x={bx + bw / 2}
						y={by - 6}
						text-anchor="middle"
						fill={color}
						font-size="11"
						font-weight="700"
					>
						{formatY(bar.value)}
					</text>
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
