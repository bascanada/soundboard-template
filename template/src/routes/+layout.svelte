<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import siteConfig from '$lib/site.config.js';

	// Dynamically import the theme CSS based on the configuration
	import(`@skeletonlabs/skeleton/themes/theme-${siteConfig.theme}.css`);

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children?.()}
