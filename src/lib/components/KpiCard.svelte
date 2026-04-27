<script lang="ts">
	interface Props {
		title: string;
		value: string;
		unit?: string;
		change?: number;
		subtitle?: string;
	}

	let { title, value, unit = '', change, subtitle }: Props = $props();

	const isPositive = $derived(change !== undefined && change >= 0);
	const formattedChange = $derived(
		change !== undefined ? `${change >= 0 ? '+' : ''}${change.toFixed(1)}%` : null
	);
</script>

<div class="card p-6 preset-filled-surface-100-900 flex flex-col gap-1">
	<p class="text-sm text-surface-600-400 uppercase tracking-wide font-medium">{title}</p>
	<p class="text-3xl font-bold mt-1">
		{#if unit === '$'}<span class="text-lg font-normal opacity-60">{unit}</span>{/if}{value}{#if unit !== '$' && unit}<span class="text-lg font-normal opacity-60 ml-1">{unit}</span>{/if}
	</p>
	{#if subtitle}
		<p class="text-xs text-surface-600-400">{subtitle}</p>
	{/if}
	{#if formattedChange !== null}
		<p class="text-sm font-semibold mt-1 {isPositive ? 'text-success-500' : 'text-error-500'}">
			{formattedChange}
			<span class="font-normal opacity-70">vs last period</span>
		</p>
	{/if}
</div>
