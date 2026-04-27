<script lang="ts">
	const themes = [
		{ value: 'cerberus', label: 'Cerberus' },
		{ value: 'wintry', label: 'Wintry' },
		{ value: 'modern', label: 'Modern' },
		{ value: 'seafoam', label: 'Seafoam' },
		{ value: 'rose', label: 'Rose' },
		{ value: 'sahara', label: 'Sahara' },
		{ value: 'mint', label: 'Mint' },
		{ value: 'rocket', label: 'Rocket' },
		{ value: 'lucid', label: 'Lucid' }
	];

	let selected = $state('cerberus');

	$effect(() => {
		selected = localStorage.getItem('theme') ?? 'cerberus';
	});

	function onChange(event: Event) {
		const value = (event.target as HTMLSelectElement).value;
		document.documentElement.setAttribute('data-theme', value);
		localStorage.setItem('theme', value);
		selected = value;
	}
</script>

<select
	class="select text-sm preset-tonal-surface rounded-base px-2 py-1 cursor-pointer"
	value={selected}
	onchange={onChange}
>
	{#each themes as theme}
		<option value={theme.value}>{theme.label}</option>
	{/each}
</select>
