<script lang="ts">
	import type { CategoryPoint } from '$lib/data/mock';

	interface Props {
		data: CategoryPoint[];
		title: string;
		color?: string;
	}

	let { data, title, color = 'var(--color-primary-500)' }: Props = $props();

	const total = $derived(data.reduce((s, d) => s + d.value, 0));
</script>

<div class="space-y-3">
	<h4 class="text-sm font-semibold text-surface-900-50">{title}</h4>
	{#each data as item}
		{@const pct = total > 0 ? (item.value / total) * 100 : 0}
		<div class="space-y-1">
			<div class="flex justify-between items-baseline text-xs">
				<span class="text-surface-700-300">{item.label}</span>
				<span class="font-semibold tabular-nums">{pct.toFixed(1)}%</span>
			</div>
			<div class="h-2 rounded-full bg-surface-200-800 overflow-hidden">
				<div
					class="h-full rounded-full transition-all duration-500"
					style="width: {pct}%; background-color: {color}"
				></div>
			</div>
		</div>
	{/each}
</div>
