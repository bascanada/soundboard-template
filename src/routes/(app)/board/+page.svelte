<script lang="ts">
	import { goto } from '$app/navigation';
	import Clip from '$lib/components/Clip.svelte';
	import siteConfig from '$lib/site.config';
	import { boardState } from '$lib/state/board.svelte.js';
	import type { Clip as ClipType } from '$lib/types';

	let { data } = $props();
	let currentPlayingId = $state<string | null>(null);
	let copied = $state(false);

	// Local state for clips (so we can remove them)
	let clipIds = $state<string[]>(data.clipIds);
	let boardId = $state<string | null>(data.boardId);

	// Get saved board info if exists
	let savedBoard = $derived(() => {
		if (boardId) {
			return boardState.getBoard(boardId);
		}
		return null;
	});

	let boardClips = $derived(() => {
		return clipIds
			.map(id => data.db.clips.find((c: ClipType) => c.id === id))
			.filter(Boolean) as ClipType[];
	});

	function removeClip(id: string) {
		clipIds = clipIds.filter(cid => cid !== id);

		// Update saved board in localStorage if this is a saved board
		if (boardId) {
			boardState.updateBoard(boardId, clipIds);
		}

		// Update URL without reload
		const newEncoded = btoa(JSON.stringify({
			clips: clipIds,
			...(boardId && { id: boardId })
		}));
		const newUrl = clipIds.length > 0 ? `/board?b=${newEncoded}` : '/board';
		goto(newUrl, { replaceState: true, noScroll: true });
	}

	async function copyLink() {
		await navigator.clipboard.writeText(window.location.href);
		copied = true;
		setTimeout(() => {
			copied = false;
		}, 2000);
	}
</script>

<svelte:head>
	<title>{savedBoard()?.name || 'Board'} | {siteConfig.title}</title>
</svelte:head>

<div class="container mx-auto space-y-4 p-2 sm:space-y-8 sm:p-4">
	<!-- Header -->
	<div class="text-center space-y-2">
		{#if savedBoard()}
			<h1 class="h3 sm:h2 font-bold">{savedBoard()?.name}</h1>
			<p class="opacity-70">
				{#if boardClips().length > 0}
					{boardClips().length} clip{boardClips().length > 1 ? 's' : ''}
				{:else}
					Board vide
				{/if}
			</p>
		{:else}
			<h1 class="h3 sm:h2 font-bold">Board personnalisé</h1>
			<p class="opacity-70">
				{#if boardClips().length > 0}
					{boardClips().length} clip{boardClips().length > 1 ? 's' : ''} dans ce board
				{:else}
					Aucun clip dans ce board
				{/if}
			</p>
		{/if}
	</div>

	<!-- Share button -->
	{#if boardClips().length > 0}
		<div class="flex justify-center gap-2">
			<button
				class="btn variant-filled-primary"
				onclick={copyLink}
			>
				{copied ? 'Lien copié!' : 'Copier le lien'}
			</button>
			<a href="/" class="btn variant-ghost-surface">
				Retour aux clips
			</a>
		</div>
	{/if}

	<!-- Grid -->
	{#if boardClips().length > 0}
		<div class="flex flex-wrap justify-center gap-3 sm:gap-6">
			{#each boardClips() as clip (clip.id)}
				<div class="flex flex-col items-center">
					<Clip
						{clip}
						bind:currentPlayingId
						boardMode={true}
						onRemoveFromBoard={removeClip}
					/>
				</div>
			{/each}
		</div>
	{:else}
		<div class="py-12 text-center">
			<span class="text-4xl">🤷</span>
			<p class="mt-2 opacity-50">
				{#if savedBoard()}
					Ce board est maintenant vide.
				{:else}
					Ce board est vide ou les clips n'existent plus.
				{/if}
			</p>
			<a href="/" class="btn variant-filled-primary mt-4">
				{savedBoard() ? 'Ajouter des clips' : 'Créer un board'}
			</a>
		</div>
	{/if}
</div>
