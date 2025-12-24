<script lang="ts">
	import { boardState } from '$lib/state/board.svelte.js';

	let copied = $state(false);
	let showSaveInput = $state(false);
	let boardName = $state('');
	let saveSuccess = $state(false);

	let encodedParam = $derived(() => {
		return boardState.encodeBoard();
	});

	async function copyLink() {
		const url = boardState.generateUrl();
		if (url) {
			await navigator.clipboard.writeText(url);
			copied = true;
			setTimeout(() => {
				copied = false;
			}, 2000);
		}
	}

	function clearBoard() {
		boardState.clear();
		showSaveInput = false;
		boardName = '';
	}

	function handleSave() {
		if (boardName.trim()) {
			boardState.saveCurrentAs(boardName.trim());
			boardName = '';
			showSaveInput = false;
			saveSuccess = true;
			setTimeout(() => {
				saveSuccess = false;
			}, 2000);
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			handleSave();
		} else if (e.key === 'Escape') {
			showSaveInput = false;
			boardName = '';
		}
	}
</script>

{#if !boardState.isEmpty || saveSuccess}
	<div
		class="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center gap-2"
	>
		<!-- Main bar -->
		<div
			class="flex items-center gap-3 rounded-2xl bg-surface-100 px-4 py-3 shadow-xl ring-1 ring-surface-300 dark:bg-surface-800 dark:ring-surface-600"
		>
			{#if saveSuccess}
				<span class="text-sm font-medium text-primary-500">
					Board sauvegardé!
				</span>
			{:else}
				<!-- Title + count -->
				<div class="flex flex-col">
					<span class="text-xs font-medium opacity-60">Nouveau board</span>
					<span class="text-sm font-bold">
						{boardState.count} clip{boardState.count > 1 ? 's' : ''}
					</span>
				</div>

				<div class="h-8 w-px bg-surface-300 dark:bg-surface-600"></div>

				{#if showSaveInput}
					<!-- Save input -->
					<input
						type="text"
						bind:value={boardName}
						onkeydown={handleKeydown}
						placeholder="Nom du board..."
						class="w-32 rounded-lg bg-surface-200 px-2 py-1 text-sm dark:bg-surface-700"
					/>
					<button
						class="btn btn-sm variant-filled-primary rounded-full"
						onclick={handleSave}
						disabled={!boardName.trim()}
					>
						OK
					</button>
					<button
						class="btn btn-sm variant-ghost-surface rounded-full"
						onclick={() => { showSaveInput = false; boardName = ''; }}
					>
						Annuler
					</button>
				{:else}
					<!-- Action buttons -->
					<button
						class="btn btn-sm variant-filled-primary rounded-full"
						onclick={() => showSaveInput = true}
						title="Sauvegarder ce board"
					>
						Sauvegarder
					</button>

					<a
						href="/board?b={encodedParam()}"
						class="btn btn-sm variant-ghost-primary rounded-full"
					>
						Voir
					</a>

					<button
						class="btn btn-sm variant-ghost-surface rounded-full"
						onclick={copyLink}
					>
						{copied ? 'Copié!' : 'Lien'}
					</button>

					<button
						class="btn-icon btn-icon-sm variant-ghost-surface rounded-full"
						onclick={clearBoard}
						title="Vider"
					>
						✕
					</button>
				{/if}
			{/if}
		</div>

		<!-- Link to saved boards -->
		{#if boardState.saved.length > 0}
			<a
				href="/boards"
				class="text-xs opacity-60 hover:opacity-100 transition-opacity"
			>
				{boardState.saved.length} board{boardState.saved.length > 1 ? 's' : ''} sauvegardé{boardState.saved.length > 1 ? 's' : ''}
			</a>
		{/if}
	</div>
{/if}
