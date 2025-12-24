<script lang="ts">
	import { boardState, type SavedBoard } from '$lib/state/board.svelte.js';
	import siteConfig from '$lib/site.config';

	let copiedId = $state<string | null>(null);

	async function copyLink(board: SavedBoard) {
		const url = boardState.generateUrl(board.clips, board.id);
		await navigator.clipboard.writeText(url);
		copiedId = board.id;
		setTimeout(() => {
			copiedId = null;
		}, 2000);
	}

	function deleteBoard(id: string) {
		if (confirm('Supprimer ce board?')) {
			boardState.deleteBoard(id);
		}
	}

	function formatDate(timestamp: number) {
		return new Date(timestamp).toLocaleDateString(undefined, {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>Mes boards | {siteConfig.title}</title>
</svelte:head>

<div class="container mx-auto space-y-6 p-4">
	<div class="flex items-center justify-between">
		<h1 class="h3 font-bold">Mes boards</h1>
		<a href="/" class="btn variant-ghost-surface btn-sm">
			Retour
		</a>
	</div>

	{#if boardState.saved.length === 0}
		<div class="py-12 text-center">
			<span class="text-4xl">📋</span>
			<p class="mt-2 opacity-50">
				Aucun board sauvegardé
			</p>
			<p class="mt-1 text-sm opacity-40">
				Sélectionne des clips sur la page principale et clique "Sauvegarder"
			</p>
			<a href="/" class="btn variant-filled-primary mt-4">
				Créer un board
			</a>
		</div>
	{:else}
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each boardState.saved as board (board.id)}
				<div
					class="rounded-xl bg-surface-100 p-4 ring-1 ring-surface-300 dark:bg-surface-800 dark:ring-surface-600"
				>
					<div class="flex items-start justify-between">
						<div>
							<h2 class="font-bold">{board.name}</h2>
							<p class="text-sm opacity-60">
								{board.clips.length} clip{board.clips.length > 1 ? 's' : ''} · {formatDate(board.createdAt)}
							</p>
						</div>
						<button
							class="btn-icon btn-icon-sm variant-ghost-error"
							onclick={() => deleteBoard(board.id)}
							title="Supprimer"
						>
							🗑️
						</button>
					</div>

					<div class="mt-4 flex flex-wrap gap-2">
						<a
							href="/board?b={boardState.encodeBoard(board.clips, board.id)}"
							class="btn btn-sm variant-filled-primary"
						>
							Ouvrir
						</a>
						<button
							class="btn btn-sm variant-ghost-surface"
							onclick={() => copyLink(board)}
						>
							{copiedId === board.id ? 'Copié!' : 'Copier le lien'}
						</button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
