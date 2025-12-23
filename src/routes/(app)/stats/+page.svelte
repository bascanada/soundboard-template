<script lang="ts">
	import siteConfig from '$lib/site.config';
	import type { Clip, StatLabels } from '$lib/types';

	let { data } = $props();

	type PeriodKey = '7d' | '30d' | 'all';

	let selectedPeriod = $state<PeriodKey>('30d');

	const statLabels: StatLabels = data.db.statLabels || {
		'7d': '7 derniers jours',
		'30d': '30 derniers jours',
		'all': 'Depuis toujours'
	};

	// Sort clips by selected period
	let rankedClips = $derived.by(() => {
		const clips = [...data.db.clips] as Clip[];
		return clips
			.map((clip) => ({
				...clip,
				periodCount: clip.stats?.[selectedPeriod] || 0
			}))
			.filter((clip) => clip.periodCount > 0)
			.sort((a, b) => b.periodCount - a.periodCount)
			.slice(0, 50); // Top 50
	});

	// Calculate total plays for selected period
	let totalPlays = $derived(
		rankedClips.reduce((sum, clip) => sum + clip.periodCount, 0)
	);

	function getMedal(rank: number): string {
		if (rank === 0) return '🥇';
		if (rank === 1) return '🥈';
		if (rank === 2) return '🥉';
		return `#${rank + 1}`;
	}

	function formatNumber(n: number): string {
		return n.toLocaleString('fr-CA');
	}
</script>

<svelte:head>
	<title>Classement - {siteConfig.title}</title>
	<meta name="description" content="Les sons les plus populaires de {siteConfig.title}" />
</svelte:head>

<div class="container mx-auto space-y-6 p-2 sm:p-4">
	<!-- Header -->
	<div class="text-center">
		<h1 class="h2 mb-2 font-bold sm:h1">Classement</h1>
		<p class="opacity-70">Les sons les plus joués</p>
	</div>

	<!-- Period Selector -->
	<div class="flex flex-wrap justify-center gap-2">
		{#each Object.entries(statLabels) as [key, label]}
			<button
				type="button"
				class="rounded-full px-4 py-2 text-sm font-medium transition-all sm:text-base
					{selectedPeriod === key
						? 'bg-primary-500 text-white shadow-lg'
						: 'bg-surface-200 text-surface-700 hover:bg-surface-300 dark:bg-surface-800 dark:text-surface-200 dark:hover:bg-surface-700'}"
				onclick={() => (selectedPeriod = key as PeriodKey)}
			>
				{label}
			</button>
		{/each}
	</div>

	<!-- Stats Summary -->
	<div class="flex justify-center gap-4 text-center">
		<div class="rounded-xl bg-surface-200/50 p-4 dark:bg-surface-800/50">
			<div class="text-2xl font-bold text-primary-500">{formatNumber(totalPlays)}</div>
			<div class="text-xs opacity-70">lectures totales</div>
		</div>
		<div class="rounded-xl bg-surface-200/50 p-4 dark:bg-surface-800/50">
			<div class="text-2xl font-bold text-secondary-500">{rankedClips.length}</div>
			<div class="text-xs opacity-70">sons joués</div>
		</div>
	</div>

	<!-- Leaderboard -->
	{#if rankedClips.length > 0}
		<div class="mx-auto max-w-2xl space-y-2">
			{#each rankedClips as clip, index (clip.id)}
				<div
					class="flex items-center gap-3 rounded-xl p-3 transition-all hover:bg-surface-200/50 dark:hover:bg-surface-800/50
						{index < 3 ? 'bg-surface-100 dark:bg-surface-800/30' : ''}"
				>
					<!-- Rank -->
					<div class="w-12 text-center text-xl font-bold">
						{getMedal(index)}
					</div>

					<!-- Thumbnail -->
					<img
						src={clip.thumbnailSrc}
						alt={clip.title}
						class="h-12 w-12 rounded-full object-cover shadow-md ring-2
							{index === 0 ? 'ring-yellow-400' : index === 1 ? 'ring-gray-400' : index === 2 ? 'ring-amber-600' : 'ring-surface-300 dark:ring-surface-600'}"
					/>

					<!-- Info -->
					<div class="min-w-0 flex-1">
						<div class="truncate font-medium">{clip.title}</div>
						<div class="text-xs capitalize opacity-60">{clip.category}</div>
					</div>

					<!-- Play Count -->
					<div class="text-right">
						<div class="font-bold text-primary-500">{formatNumber(clip.periodCount)}</div>
						<div class="text-xs opacity-60">lectures</div>
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<div class="py-12 text-center">
			<span class="text-4xl">📊</span>
			<p class="mt-2 opacity-50">Aucune donnée disponible pour cette période.</p>
			<p class="text-xs opacity-40">Les statistiques apparaîtront après quelques lectures.</p>
		</div>
	{/if}

	<!-- Back Link -->
	<div class="text-center">
		<a
			href="/"
			class="inline-flex items-center gap-2 rounded-full bg-surface-200 px-4 py-2 text-sm font-medium transition-all hover:bg-surface-300 dark:bg-surface-800 dark:hover:bg-surface-700"
		>
			← Retour aux sons
		</a>
	</div>
</div>
