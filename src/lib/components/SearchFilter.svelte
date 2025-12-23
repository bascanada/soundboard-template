<script lang="ts">
	let {
		categories,
		selectedCategories = $bindable<string[]>([]),
		searchQuery = $bindable('')
	} = $props();

	let isDropdownOpen = $state(false);
	let inputRef = $state<HTMLInputElement>();

	// Filter categories based on search query for suggestions
	let filteredCategories = $derived(
		categories.filter((cat: string) =>
			cat.toLowerCase().includes(searchQuery.toLowerCase())
		)
	);

	function toggleCategory(category: string) {
		if (selectedCategories.includes(category)) {
			selectedCategories = selectedCategories.filter((c: string) => c !== category);
		} else {
			selectedCategories = [...selectedCategories, category];
		}
	}

	function removeCategory(category: string) {
		selectedCategories = selectedCategories.filter((c: string) => c !== category);
	}

	function clearAll() {
		selectedCategories = [];
		searchQuery = '';
	}

	function handleFocus() {
		isDropdownOpen = true;
	}

	function handleBlur(e: FocusEvent) {
		// Delay to allow click on dropdown items
		setTimeout(() => {
			isDropdownOpen = false;
		}, 150);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			isDropdownOpen = false;
			inputRef?.blur();
		}
	}
</script>

<div class="mx-auto w-full max-w-md">
	<!-- Search Input -->
	<div class="relative">
		<div class="relative">
			<span class="absolute left-3 top-1/2 -translate-y-1/2 text-lg">
				🔍
			</span>
			<input
				bind:this={inputRef}
				bind:value={searchQuery}
				type="text"
				placeholder="Rechercher un son ou une catégorie..."
				class="w-full rounded-full border-2 border-surface-300 bg-surface-100 py-2.5 pr-10 pl-10 text-sm transition-all placeholder:text-surface-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-surface-700 dark:bg-surface-800 dark:placeholder:text-surface-400 sm:py-3 sm:text-base"
				onfocus={handleFocus}
				onblur={handleBlur}
				onkeydown={handleKeydown}
			/>
			{#if searchQuery || selectedCategories.length > 0}
				<button
					type="button"
					class="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 transition-colors hover:text-error-500"
					onclick={clearAll}
				>
					✕
				</button>
			{/if}
		</div>

		<!-- Category Dropdown -->
		{#if isDropdownOpen && filteredCategories.length > 0}
			<div class="absolute z-50 mt-2 w-full rounded-xl border border-surface-200 bg-surface-50 p-2 shadow-xl dark:border-surface-700 dark:bg-surface-800">
				<div class="mb-1 px-2 text-xs font-medium uppercase tracking-wide text-surface-500">
					Catégories
				</div>
				<div class="flex flex-wrap gap-1.5">
					{#each filteredCategories as category}
						<button
							type="button"
							class="rounded-full px-3 py-1 text-sm font-medium transition-all
								{selectedCategories.includes(category)
									? 'bg-primary-500 text-white'
									: 'bg-surface-200 text-surface-700 hover:bg-surface-300 dark:bg-surface-700 dark:text-surface-200 dark:hover:bg-surface-600'}"
							onmousedown={() => toggleCategory(category)}
						>
							{#if selectedCategories.includes(category)}
								<span class="mr-1">✓</span>
							{/if}
							<span class="capitalize">{category}</span>
						</button>
					{/each}
				</div>
			</div>
		{/if}
	</div>

	<!-- Selected Categories Pills -->
	{#if selectedCategories.length > 0}
		<div class="mt-3 flex flex-wrap items-center justify-center gap-2">
			{#each selectedCategories as category}
				<span class="inline-flex items-center gap-1 rounded-full bg-primary-500/20 px-3 py-1 text-sm font-medium text-primary-600 dark:text-primary-400">
					<span class="capitalize">{category}</span>
					<button
						type="button"
						class="ml-1 rounded-full p-0.5 transition-colors hover:bg-primary-500/30"
						onclick={() => removeCategory(category)}
					>
						✕
					</button>
				</span>
			{/each}
		</div>
	{/if}
</div>
