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

	<!-- Theme Selection -->
	<div class="space-y-2">
		<label for="theme" class="font-bold">Thème</label>
		<select
			id="theme"
			bind:value={settingsState.theme}
			class="select w-full rounded-lg border-surface-200 bg-surface-100 p-2 dark:border-surface-700 dark:bg-surface-800"
		>
			<option value="wintry">Wintry</option>
			<option value="modern">Modern</option>
			<option value="rocket">Rocket</option>
			<option value="seafoam">Seafoam</option>
			<option value="vintage">Vintage</option>
			<option value="sahara">Sahara</option>
			<option value="hamlindigo">Hamlindigo</option>
			<option value="gold-nouveau">Gold Nouveau</option>
			<option value="crimson">Crimson</option>
		</select>
	</div>

	<!-- Dark Mode Toggle -->
	<div class="flex items-center justify-between">
		<label for="darkmode" class="font-bold">Mode Sombre</label>
		<input
			type="checkbox"
			id="darkmode"
			bind:checked={settingsState.darkMode}
			class="checkbox h-6 w-6 rounded border-surface-300 bg-surface-100 checked:bg-primary-500 dark:border-surface-600 dark:bg-surface-800"
		/>
	</div>
</div>
