<script lang="ts">
	import { Switch } from '@skeletonlabs/skeleton-svelte';

	let checked = $state(false);

	$effect(() => {
		checked = (localStorage.getItem('mode') ?? 'light') === 'dark';
	});

	function onCheckedChange(event: { checked: boolean }) {
		const mode = event.checked ? 'dark' : 'light';
		document.documentElement.setAttribute('data-mode', mode);
		localStorage.setItem('mode', mode);
		checked = event.checked;
	}
</script>

<div class="flex items-center gap-2.5 min-h-10 py-1">
	<span class="text-xs text-surface-600-400 hidden sm:block shrink-0">
		{checked ? 'Dark' : 'Light'}
	</span>
	<Switch class="shrink-0" {checked} {onCheckedChange}>
		<Switch.Control>
			<Switch.Thumb />
		</Switch.Control>
		<Switch.HiddenInput name="mode" />
	</Switch>
</div>
