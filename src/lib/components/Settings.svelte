<script>
	import { settingsState } from '$lib/state/settings.svelte.js';
</script>

<div class="space-y-6 p-4">
	<h2 class="h2">Paramètres</h2>

	<!-- Volume Control -->
	<div class="space-y-2">
		<label for="volume" class="flex justify-between font-bold">
			<span>Volume</span>
			<span>{Math.round(settingsState.volume * 100)}%</span>
		</label>
		<input
			type="range"
			id="volume"
			min="0"
			max="1"
			step="0.01"
			bind:value={settingsState.volume}
			class="h-2 w-full cursor-pointer appearance-none rounded-lg bg-surface-200 accent-primary-500 dark:bg-surface-700"
		/>
	</div>

	<!-- Pod Size Control -->
	<div class="space-y-2">
		<label for="size" class="flex justify-between font-bold">
			<span>Taille des boutons</span>
			<span>{settingsState.podSize}x</span>
		</label>
		<input
			type="range"
			id="size"
			min="0.5"
			max="2"
			step="0.1"
			bind:value={settingsState.podSize}
			class="h-2 w-full cursor-pointer appearance-none rounded-lg bg-surface-200 accent-primary-500 dark:bg-surface-700"
		/>
	</div>
</div>
