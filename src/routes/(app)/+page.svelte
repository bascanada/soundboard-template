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
			: data.db.clips.filter((clip: import('$lib/types').Clip) =>
					selectedCategories.includes(clip.category)
				)
	);
</script>

<svelte:head>
	<title>{siteConfig.title}</title>
</svelte:head>

<div class="container mx-auto space-y-8 p-4">
	<!-- Filter -->
	<div class="flex justify-center">
		<CategoryFilter categories={data.db.categories} bind:selectedCategories />
	</div>

	<!-- Grid -->
	<div class="flex flex-wrap justify-center gap-6">
		{#each filteredClips as clip (clip.id)}
			<div class="flex flex-col items-center">
				<Clip {clip} bind:currentPlayingId />
			</div>
		{/each}
	</div>

	{#if filteredClips.length === 0}
		<div class="text-center opacity-50">Aucun clip trouvé pour les catégories sélectionnées.</div>
	{/if}
</div>
