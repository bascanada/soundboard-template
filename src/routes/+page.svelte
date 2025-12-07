<script lang="ts">
	import CategoryFilter from '$lib/components/CategoryFilter.svelte';
	import Clip from '$lib/components/Clip.svelte';
	import siteConfig from '$lib/site.config';

	let { data } = $props();
	let selectedCategories = $state<string[]>([]);
	let currentPlayingId = $state<string | null>(null);

	let filteredClips = $derived(
		selectedCategories.length === 0
			? data.db.clips
			: data.db.clips.filter((clip: import('$lib/types').Clip) => selectedCategories.includes(clip.category))
	);
</script>

<svelte:head>
	<title>{siteConfig.title}</title>
</svelte:head>

<div class="container mx-auto p-4 space-y-8">
	<!-- Header -->
	<header class="text-center space-y-4">
		<h1 class="h1">{siteConfig.title}</h1>
	</header>

	<!-- Filter -->
	<div class="flex justify-center">
		<CategoryFilter categories={data.db.categories} bind:selectedCategories />
	</div>

	<!-- Grid -->
	<div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-6 justify-items-center">
		{#each filteredClips as clip (clip.id)}
			<div class="flex flex-col items-center">
				<Clip {clip} bind:currentPlayingId />
			</div>
		{/each}
	</div>
	
	{#if filteredClips.length === 0}
		<div class="text-center opacity-50">No clips found for selected categories.</div>
	{/if}
</div>
