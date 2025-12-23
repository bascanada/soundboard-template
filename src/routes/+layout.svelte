<script lang="ts">
	import '../app.css';
	import siteConfig from '$lib/site.config';
	import { settingsState, saveSettings } from '$lib/state/settings.svelte.js';
	import { onMount } from 'svelte';
	import { consentState } from '$lib/state/consent.svelte.js';
	import ConsentBanner from '$lib/components/ConsentBanner.svelte';
	import { browser } from '$app/environment';
	import { afterNavigate } from '$app/navigation';

	$effect(() => {
		if (settingsState.darkMode) {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
		saveSettings();
	});

	onMount(() => {
		consentState.init();
	});

	// Track page views on SPA navigation
	afterNavigate(() => {
		if (consentState.analytics && typeof window.gtag === 'function') {
			window.gtag('event', 'page_view', {
				page_title: document.title,
				page_location: window.location.href,
				page_path: window.location.pathname
			});
		}
	});

	// Dynamic theme import
	const themes = import.meta.glob('/node_modules/@skeletonlabs/skeleton/dist/themes/*.css');

	$effect(() => {
		const themePath = `/node_modules/@skeletonlabs/skeleton/dist/themes/${settingsState.theme}.css`;
		if (themes[themePath]) {
			themes[themePath]();
		}
		document.documentElement.setAttribute('data-theme', settingsState.theme);
	});

	let { children } = $props();
</script>

<svelte:head>
	<title>{siteConfig.title}</title>
	<meta name="description" content={siteConfig.description} />
	<meta name="keywords" content={siteConfig.keywords.join(', ')} />
	<meta name="author" content={siteConfig.author} />
	<meta name="theme-color" content={siteConfig.pwa.theme_color} />

	<!-- PWA -->
	<meta name="application-name" content={siteConfig.pwa.name} />
	<meta name="apple-mobile-web-app-title" content={siteConfig.pwa.short_name} />
	<meta name="apple-mobile-web-app-capable" content="yes" />
	<meta name="apple-mobile-web-app-status-bar-style" content="default" />
	<link rel="icon" href={siteConfig.favicon} />
</svelte:head>

{@render children?.()}
<ConsentBanner />
