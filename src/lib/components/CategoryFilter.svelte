<script lang="ts">
	let { categories, selectedCategories = $bindable([]) } = $props();

	function toggleCategory(category: string) {
		if (selectedCategories.includes(category)) {
			selectedCategories = selectedCategories.filter((c: string) => c !== category);
		} else {
			selectedCategories = [...selectedCategories, category];
		}
	}

	function clearAll() {
		selectedCategories = [];
	}
</script>

<div class="mb-6 flex flex-wrap items-center justify-center gap-3">
	{#each categories as category}
		<button
			type="button"
			class="
                inline-flex items-center rounded-full border px-4 py-2 font-medium transition-all duration-200
                {selectedCategories.includes(category)
				? 'scale-105 border-primary-600 bg-primary-500 text-white shadow-lg'
				: 'border-transparent bg-surface-200 text-surface-900 hover:scale-105 hover:bg-surface-300 dark:bg-surface-800 dark:text-surface-50 dark:hover:bg-surface-700'}
            "
			onclick={() => toggleCategory(category)}
			onkeydown={(e) => e.key === 'Enter' && toggleCategory(category)}
		>
			{#if selectedCategories.includes(category)}
				<span class="mr-2">✓</span>
			{/if}
			<span class="capitalize">{category}</span>
		</button>
	{/each}

	{#if selectedCategories.length > 0}
		<button
			type="button"
			class="inline-flex items-center rounded-full border border-transparent bg-error-500/10 px-4 py-2 font-medium text-error-500 transition-all duration-200 hover:border-error-600 hover:bg-error-500 hover:text-white"
			onclick={clearAll}
		>
			<span class="mr-2">✕</span>
			<span>Effacer</span>
		</button>
	{/if}
</div>
