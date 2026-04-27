<script lang="ts">
	import { timeFormat } from 'd3';
	import { fly } from 'svelte/transition';
	import StaysChart from '$lib/components/charts/StaysChart.svelte';
	import BreakdownChart from '$lib/components/charts/BreakdownChart.svelte';
	import KpiCard from '$lib/components/KpiCard.svelte';
	import { patientTimeSeries, kpis } from '$lib/data/mock';
	import type { MonthlyPatientData } from '$lib/data/mock';

	let selectedMonth = $state<MonthlyPatientData | null>(null);

	function onMonthSelect(point: MonthlyPatientData) {
		selectedMonth = point;
	}

	const formatMonth = timeFormat('%B %Y');

	const breakdownCharts = [
		{ key: 'age', title: 'Age Groups', color: 'var(--color-primary-500)'   },
		{ key: 'sex', title: 'Sex',        color: 'var(--color-secondary-500)' }
	] as const;
</script>

<div class="max-w-7xl mx-auto px-4 sm:px-6 pb-8 pt-4 space-y-6">

	<!-- KPI Cards -->
	<section class="grid grid-cols-1 sm:grid-cols-3 gap-4">
		{#each kpis as kpi}
			<KpiCard {...kpi} />
		{/each}
	</section>

	<!-- Chart + breakdown side by side -->
	<div class="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">

		<!-- Left: stays chart -->
		<div class="card preset-filled-surface-100-900 p-6">
			<div class="flex items-center justify-between mb-1">
				<h2 class="text-base font-semibold text-surface-900-50">Monthly Hospital Stays</h2>
				<span class="text-xs text-surface-600-400">Click a month to explore</span>
			</div>
			<StaysChart
				data={patientTimeSeries}
				onSelect={onMonthSelect}
				selectedDate={selectedMonth?.date ?? null}
			/>
		</div>

		<!-- Right: patient profile breakdown -->
		<div class="flex flex-col gap-4">
			{#if selectedMonth === null}
				<!-- Empty state -->
				<div class="card preset-filled-surface-100-900 flex-1 flex flex-col items-center justify-center text-center gap-3 p-8 min-h-64">
					<svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 opacity-25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
						<path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
					</svg>
					<p class="text-sm text-surface-600-400 leading-relaxed">
						Select a month in the chart<br>to view the patient profile
					</p>
				</div>
			{:else}
				<!-- Header -->
				{#key selectedMonth.date.toISOString()}
					<div in:fly={{ y: 6, duration: 200 }} class="flex items-center gap-2 flex-wrap">
						<h2 class="text-base font-semibold text-surface-900-50">Patient Profile</h2>
						<span class="badge preset-tonal-primary">{formatMonth(selectedMonth.date)}</span>
						<span class="text-sm text-surface-600-400">{selectedMonth.value} patients</span>
					</div>
				{/key}

				{#each breakdownCharts as chart}
					<div class="card preset-filled-surface-100-900 p-5 flex-1">
						<BreakdownChart
							data={selectedMonth.breakdown[chart.key]}
							title={chart.title}
							color={chart.color}
						/>
					</div>
				{/each}
			{/if}
		</div>

	</div>

</div>
