<script lang="ts">
	import '../app.css';
	import { AppBar } from '@skeletonlabs/skeleton-svelte';
	import LightSwitch from '$lib/components/LightSwitch.svelte';
	import ThemePicker from '$lib/components/ThemePicker.svelte';
	import { page } from '$app/state';
	import { base } from '$app/paths';

	let { children } = $props();

	const siteTitle = 'LUCID Dashboard';
	const siteDescription =
		'Hospital quality metrics and Low-Value Care (LVC) stewardship dashboards.';

	const shareImage = $derived(`${page.url.origin}${base}/final-logo.jpeg`);

	const lvcItems = [
		{
			href: `${base}/`,
			label: 'LVC 1',
			description:
				'Do not use benzodiazepines or other sedativa-hypnotics in older adults as first choice for insomnia, agitation or delirium'
		},
		{
			href: `${base}/lvc-2/`,
			label: 'LVC 2',
			description: 'Do not transfuse more than the minimum number of red blood units necessary'
		},
		{
			href: `${base}/lvc-3/`,
			label: 'LVC 3',
			description:
				'Do not order blood tests at regular intervals or routine extensive lab panels including X-rays without specific clinical questions'
		}
	];

	const activeLvc = $derived(
		lvcItems.find((item) => {
			const path = page.url.pathname.replace(/\/$/, '') || '/';
			const href = item.href.replace(/\/$/, '') || '/';
			return path === href;
		}) ?? lvcItems[0]
	);
</script>

<svelte:head>
	<title>{siteTitle}</title>
	<meta name="description" content={siteDescription} />
	<link rel="canonical" href={page.url.href} />

	<meta property="og:site_name" content={siteTitle} />
	<meta property="og:type" content="website" />
	<meta property="og:title" content={siteTitle} />
	<meta property="og:description" content={siteDescription} />
	<meta property="og:url" content={page.url.href} />
	<meta property="og:image" content={shareImage} />
	<meta property="og:image:type" content="image/jpeg" />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={siteTitle} />
	<meta name="twitter:description" content={siteDescription} />
	<meta name="twitter:image" content={shareImage} />
</svelte:head>

<div class="flex flex-col h-screen overflow-hidden">
	<!-- Top AppBar -->
	<AppBar>
		<AppBar.Toolbar class="grid-cols-[auto_1fr_auto]">
			<AppBar.Lead>
				<a
					href="{base}/"
					class="flex items-center gap-2 rounded-container preset-tonal-surface hover:preset-filled-surface-100-900 px-1 py-0.5 -ml-1 shrink-0"
				>
					<img
						src="{base}/lucid_logo.svg"
						alt=""
						class="h-9 w-auto max-w-[min(100%,11rem)] object-contain object-left"
						width="160"
						height="36"
					/>
					<span class="sr-only">{siteTitle}</span>
				</a>
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
						class="btn btn-sm {activeLvc === item
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
