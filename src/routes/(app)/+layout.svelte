<script lang="ts">
	import siteConfig from '$lib/site.config';

	import { audioState } from '$lib/state/audio.svelte.js';
	import { settingsState, saveSettings } from '$lib/state/settings.svelte.js';
	import Settings from '$lib/components/Settings.svelte';

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
		class="sticky top-0 z-40 flex items-center justify-between bg-surface-50/50 p-2 backdrop-blur-md sm:p-4 dark:bg-surface-900/50"
	>
		<a href="/" class="flex flex-col hover:opacity-80 transition-opacity">
			<h1 class="h4 font-bold sm:h3">{siteConfig.title} 🔊</h1>
			<p class="hidden text-xs opacity-70 sm:block">{siteConfig.description}</p>
		</a>
		<div class="flex items-center gap-2">
			<a
				href="/stats"
				class="variant-ghost-surface btn btn-sm hover:scale-105 transition-transform"
			>
				🏆 <span class="hidden sm:inline">Classement</span>
			</a>
			<button class="variant-ghost-surface btn btn-sm hover:rotate-12 hover:scale-110 transition-transform" onclick={toggleSettings}>
				⚙️ <span class="hidden sm:inline">Paramètres</span>
			</button>
		</div>
	</header>

	<div class="relative z-10 flex-1">
		{@render children?.()}
	</div>

	<footer class="relative z-10 space-y-1 p-2 text-center text-xs opacity-60 sm:p-4">
		<p>Last updated: {buildDate}</p>
		<p>
			Made with
			<a
				href="https://github.com/bascanada/soundboard-template"
				target="_blank"
				rel="noopener noreferrer"
				class="underline decoration-primary-500 decoration-wavy hover:text-primary-500 transition-colors"
			>
				soundboard-template
			</a>
			 ✨ Fork it & make your own!
		</p>
	</footer>
</div>
