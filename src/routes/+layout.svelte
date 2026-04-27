<script lang="ts">
	import '../app.css';
	import { AppBar } from '@skeletonlabs/skeleton-svelte';
	import LightSwitch from '$lib/components/LightSwitch.svelte';
	import ThemePicker from '$lib/components/ThemePicker.svelte';
	import { page } from '$app/stores';

	let { children } = $props();

	const lvcItems = [
		{
			href: '/',
			label: 'LVC 1',
			description:
				'Do not use benzodiazepines or other sedativa-hypnotics in older adults as first choice for insomnia, agitation or delirium'
		},
		{
			href: '/lvc-2',
			label: 'LVC 2',
			description: 'Do not transfuse more than the minimum number of red blood units necessary'
		},
		{
			href: '/lvc-3',
			label: 'LVC 3',
			description:
				'Do not order blood tests at regular intervals or routine extensive lab panels including X-rays without specific clinical questions'
		}
	];

	const activeLvc = $derived(
		lvcItems.find((item) => item.href === $page.url.pathname) ?? lvcItems[0]
	);
</script>

<div class="flex flex-col h-screen overflow-hidden">
	<!-- Top AppBar -->
	<AppBar>
		<AppBar.Toolbar class="grid-cols-[auto_1fr_auto]">
			<AppBar.Lead>
				<span class="text-xl font-bold tracking-tight">LUCID Dashboard</span>
			</AppBar.Lead>
			<AppBar.Headline />
			<AppBar.Trail>
				<div class="flex items-center gap-3">
					<ThemePicker />
					<LightSwitch />
				</div>
			</AppBar.Trail>
		</AppBar.Toolbar>
	</AppBar>

	<!-- Main content area (full width, no sidebar) -->
	<main class="flex-1 overflow-auto bg-surface-50-950">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-4">
			<!-- Title -->
			<h1 class="text-3xl font-bold tracking-tight text-surface-900-50">Hospital X</h1>

			<!-- LVC Tabs -->
			<div class="flex gap-1 mt-4">
				{#each lvcItems as item}
					<a
						href={item.href}
						class="btn btn-sm {$page.url.pathname === item.href
							? 'preset-filled-primary-500'
							: 'preset-tonal-surface'}"
					>
						{item.label}
					</a>
				{/each}
			</div>

			<!-- Active LVC description — fixed height to prevent layout shift -->
			<div class="mt-3 h-12 flex items-center">
				<p class="text-sm text-surface-600-400 max-w-2xl line-clamp-2">
					{activeLvc.description}
				</p>
			</div>

			<div class="h-px bg-surface-200-800"></div>
		</div>

		{@render children()}
	</main>
</div>
