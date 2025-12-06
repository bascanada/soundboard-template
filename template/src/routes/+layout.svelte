<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import siteConfig from '$lib/site.config';

	// Dynamic theme import
	// We use a glob import to ensure Vite can analyze the files
	const themes = import.meta.glob('/node_modules/@skeletonlabs/skeleton/dist/themes/*.css');
	const themePath = `/node_modules/@skeletonlabs/skeleton/dist/themes/${siteConfig.theme}.css`;
	
	if (themes[themePath]) {
		themes[themePath]();
	}

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children?.()}
