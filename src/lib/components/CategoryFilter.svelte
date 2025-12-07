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

<div class="flex flex-wrap gap-2 mb-6 items-center">
	{#each categories as category}
		<button
			class="chip {selectedCategories.includes(category) ? 'variant-filled-primary' : 'variant-soft-surface'}"
			onclick={() => toggleCategory(category)}
		>
			{#if selectedCategories.includes(category)}
				<span>✅</span>
			{/if}
			<span>{category}</span>
		</button>
	{/each}

	{#if selectedCategories.length > 0}
		<button class="chip variant-soft-error" onclick={clearAll}>
			✕ Clear All
		</button>
	{/if}
</div>
