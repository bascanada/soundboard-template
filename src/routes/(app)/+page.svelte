<script lang="ts">
	import SearchFilter from '$lib/components/SearchFilter.svelte';
	import Clip from '$lib/components/Clip.svelte';
	import siteConfig from '$lib/site.config';

	let { data } = $props();
	let selectedCategories = $state<string[]>([]);
	let searchQuery = $state('');
	let currentPlayingId = $state<string | null>(null);

	let filteredClips = $derived.by(() => {
		let clips = data.db.clips;

		// Filter by selected categories
		if (selectedCategories.length > 0) {
			clips = clips.filter((clip: import('$lib/types').Clip) =>
				selectedCategories.includes(clip.category)
			);
		}

		// Filter by search query (against title)
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase().trim();
			clips = clips.filter((clip: import('$lib/types').Clip) =>
				clip.title.toLowerCase().includes(query)
			);
		}

		return clips;
	});
</script>

<svelte:head>
	<title>{siteConfig.title}</title>
</svelte:head>

<div class="container mx-auto space-y-4 p-2 sm:space-y-8 sm:p-4">
	<!-- Search & Filter -->
	<div class="flex justify-center">
		<SearchFilter
			categories={data.db.categories}
			bind:selectedCategories
			bind:searchQuery
		/>
	</div>

	<!-- Clip count badge -->
	<div class="text-center">
		<span class="inline-block rounded-full bg-primary-500/20 px-3 py-1 text-sm font-medium text-primary-500">
			🎵 {filteredClips.length} son{filteredClips.length > 1 ? 's' : ''} disponible{filteredClips.length > 1 ? 's' : ''}
		</span>
	</div>

	<!-- Grid -->
	<div class="flex flex-wrap justify-center gap-3 sm:gap-6">
		{#each filteredClips as clip (clip.id)}
			<div class="flex flex-col items-center">
				<Clip {clip} bind:currentPlayingId />
			</div>
		{/each}
	</div>

	{#if filteredClips.length === 0}
		<div class="py-12 text-center">
			<span class="text-4xl">🤷</span>
			<p class="mt-2 opacity-50">
				{#if searchQuery}
					Aucun son trouvé pour "{searchQuery}"
				{:else}
					Aucun clip trouvé pour les filtres sélectionnés.
				{/if}
			</p>
		</div>
	{/if}
</div>
