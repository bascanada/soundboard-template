<script lang="ts">
	import '../app.css';
	import siteConfig from '$lib/site.config';

	import { audioState } from '$lib/state/audio.svelte.js';
	import { settingsState } from '$lib/state/settings.svelte.js';
	import Settings from '$lib/components/Settings.svelte';

	// Dynamic theme loading
	// We use a glob import to ensure Vite can analyze the files
	const themes = import.meta.glob('/node_modules/@skeletonlabs/skeleton/dist/themes/*.css');

	// Load settings from localStorage on mount
	$effect(() => {
		const savedSettings = localStorage.getItem('soundboard-settings');
		if (savedSettings) {
			const parsed = JSON.parse(savedSettings);
			// Apply saved settings to state
			if (parsed.theme) settingsState.theme = parsed.theme;
			if (parsed.volume !== undefined) settingsState.volume = parsed.volume;
			if (parsed.podSize !== undefined) settingsState.podSize = parsed.podSize;
			if (parsed.darkMode !== undefined) settingsState.darkMode = parsed.darkMode;
		} else {
			// Fallback to site default if no storage
			settingsState.theme = siteConfig.theme;
		}
	});

	// Reactive effect to load theme CSS when state changes
	$effect(() => {
		const themePath = `/node_modules/@skeletonlabs/skeleton/dist/themes/${settingsState.theme}.css`;
		if (themes[themePath]) {
			themes[themePath]().then(() => {
				// Theme loaded
			});
		}
	});

	// Reactive effect for Dark Mode
	$effect(() => {
		if (settingsState.darkMode) {
			document.body.classList.add('dark');
		} else {
			document.body.classList.remove('dark');
		}
	});

	// Save to localStorage when state changes
	$effect(() => {
		const toSave = {
			theme: settingsState.theme,
			volume: settingsState.volume,
			podSize: settingsState.podSize,
			darkMode: settingsState.darkMode
		};
		localStorage.setItem('soundboard-settings', JSON.stringify(toSave));
	});

	// Import build metadata
	import buildMetadata from '$lib/build.json';

	let { children } = $props();

	function toggleSettings() {
		settingsState.isOpen = !settingsState.isOpen;
	}

	// Format date nicely
	const buildDate = new Date(buildMetadata.timestamp).toLocaleString(undefined, {
		dateStyle: 'medium',
		timeStyle: 'short'
	});
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

<!-- Drawer Overlay -->
{#if settingsState.isOpen}
	<div
		class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity"
		onclick={toggleSettings}
		role="button"
		tabindex="0"
		onkeydown={(e) => e.key === 'Escape' && toggleSettings()}
	></div>
	<!-- Drawer Panel -->
	<div
		class="bg-surface-50-900-token fixed top-0 right-0 z-50 h-full w-80 translate-x-0 transform p-4 shadow-xl transition-transform duration-300"
	>
		<div class="mb-4 flex justify-end">
			<button class="btn-icon btn-icon-sm" onclick={toggleSettings}> ✕ </button>
		</div>
		<Settings />
	</div>
{/if}

<div
	class="bg-surface-50-900-token relative flex min-h-screen flex-col overflow-hidden transition-colors duration-500"
>
	<!-- Background Gradients -->
	<div
		class="pointer-events-none fixed top-0 left-0 -z-10 h-full w-full overflow-hidden transition-opacity duration-700 ease-in-out"
		class:opacity-100={audioState.isPlaying}
		class:opacity-30={!audioState.isPlaying}
	>
		<div
			class="absolute top-[-20%] left-[-10%] h-[60vw] w-[60vw] rounded-full bg-primary-500/30 blur-[100px] transition-all duration-1000"
			class:animate-pulse-slow={audioState.isPlaying}
		></div>
		<div
			class="absolute right-[-10%] bottom-[-20%] h-[60vw] w-[60vw] rounded-full bg-secondary-500/30 blur-[100px] transition-all duration-1000"
			class:animate-pulse-slow={audioState.isPlaying}
			style="animation-delay: 1s;"
		></div>
		<div
			class="absolute top-[40%] left-[40%] h-[40vw] w-[40vw] rounded-full bg-tertiary-500/20 blur-[120px] transition-all duration-1000"
			class:animate-pulse-slow={audioState.isPlaying}
			style="animation-delay: 2s;"
		></div>
	</div>

	<!-- AppBar -->
	<header
		class="sticky top-0 z-40 flex items-center justify-between bg-surface-50/50 p-4 backdrop-blur-md dark:bg-surface-900/50"
	>
		<h1 class="h3 font-bold">{siteConfig.title}</h1>
		<button class="variant-ghost-surface btn btn-sm" onclick={toggleSettings}>
			⚙️ Paramètres
		</button>
	</header>

	<div class="relative z-10 flex-1">
		{@render children?.()}
	</div>

	<footer class="relative z-10 p-4 text-center text-xs opacity-50">
		Last updated: {buildDate}
	</footer>
</div>
