<script lang="ts">
	import { Menu, Portal } from '@skeletonlabs/skeleton-svelte';

	const themes = [
		{ value: 'lucid', label: 'Lucid' },
		{ value: 'cerberus', label: 'Cerberus' },
		{ value: 'wintry', label: 'Wintry' }
	] as const;

	type ThemeId = (typeof themes)[number]['value'];
	const themeValues = new Set<string>(themes.map((t) => t.value));

	function resolveStoredTheme(): ThemeId {
		const raw = localStorage.getItem('theme');
		if (raw && themeValues.has(raw)) return raw as ThemeId;
		return 'lucid';
	}

	let selected = $state<ThemeId>('lucid');

	$effect(() => {
		const t = resolveStoredTheme();
		if (localStorage.getItem('theme') !== t) localStorage.setItem('theme', t);
		selected = t;
	});

	function onChange(event: Event) {
		const value = (event.target as HTMLSelectElement).value as ThemeId;
		document.documentElement.setAttribute('data-theme', value);
		localStorage.setItem('theme', value);
		selected = value;
	}
</script>

<select
	class="btn btn-sm preset-tonal-surface"
	value={selected}
	onchange={onChange}
>
	{#each themes as theme}
		<option value={theme.value}>{theme.label}</option>
	{/each}
</select>
