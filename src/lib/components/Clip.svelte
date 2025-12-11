<script lang="ts">
	import { onMount } from 'svelte';
	import type { Clip } from '$lib/types';

	import { audioState } from '$lib/state/audio.svelte.js';
	import { settingsState } from '$lib/state/settings.svelte.js';
	import { consentState } from '$lib/state/consent.svelte.js';

	let { clip, currentPlayingId = $bindable(null) } = $props();

	let audio = $state<HTMLAudioElement>();
	let video = $state<HTMLVideoElement>();
	let isPlaying = $state(false);
	let isViewed = $state(false);
	let progress = $state(0); // 0 to 1
	let duration = $state(0);

	// SVG Config - Reactive based on settings
	const baseSize = 100;
	let size = $derived(baseSize * settingsState.podSize);
	const strokeWidth = 4;
	let radius = $derived((size - strokeWidth) / 2);
	let circumference = $derived(2 * Math.PI * radius);

	// Update volume when it changes
	$effect(() => {
		if (audio) audio.volume = settingsState.volume;
		if (video) video.volume = settingsState.volume;
	});

	// Reactive state for playback
	$effect(() => {
		if (currentPlayingId !== clip.id) {
			pause();
		}
	});

	function togglePlay() {
		if (isPlaying) {
			pause();
		} else {
			play();
		}
	}

	async function play() {
		// Stop others
		currentPlayingId = clip.id;

		// --- ANALYTICS TRACKING START ---
		// We check for window.gtag to avoid errors if blocked by adblockers
		// AND check for explicit user consent
		if (consentState.analytics && typeof window.gtag === 'function') {
			window.gtag('event', 'play_clip', {
				event_category: 'Audio',
				event_label: clip.title,
				clip_id: clip.id, // This ID links back to your config
				clip_category: clip.category
			});
		}
		// --- ANALYTICS TRACKING END ---

		try {
			if (clip.videoSrc && video) {
				video.volume = settingsState.volume;
				await video.play();
			} else if (audio) {
				audio.volume = settingsState.volume;
				await audio.play();
			}
			isPlaying = true;
			isViewed = true;
			audioState.isPlaying = true;
		} catch (e) {
			console.error('Playback failed', e);
			isPlaying = false;
			audioState.isPlaying = false;
		}
	}

	function pause() {
		if (!isPlaying) return;

		if (clip.videoSrc && video) {
			video.pause();
			video.currentTime = 0;
		} else if (audio) {
			audio.pause();
			audio.currentTime = 0;
		}
		isPlaying = false;
		progress = 0;
		// Only set global state to false if we are the one playing
		if (currentPlayingId === clip.id) {
			audioState.isPlaying = false;
		}
	}

	function handleTimeUpdate(e: Event) {
		const target = e.target as HTMLMediaElement;
		duration = target.duration;
		progress = target.currentTime / target.duration;
	}

	function handleEnded() {
		isPlaying = false;
		progress = 0;
		currentPlayingId = null;
		audioState.isPlaying = false;
		if (video) {
			video.currentTime = 0;
		}
	}

	// Calculate stroke dashoffset
	// progress 0 -> offset = circumference
	// progress 1 -> offset = 0
	let strokeDashoffset = $derived(circumference - progress * circumference);

	// Optional: Hover optimization
	function handleHover() {
		if (audio) audio.preload = 'metadata';
		if (video) video.preload = 'metadata';
	}
</script>

<div
	class="relative cursor-pointer overflow-hidden rounded-full transition-transform duration-200 hover:scale-105 active:scale-95"
	style:width="{size}px"
	style:height="{size}px"
	onclick={togglePlay}
	role="button"
	tabindex="0"
	onmouseenter={handleHover}
	onkeydown={(e) => e.key === 'Enter' && togglePlay()}
>
	<!-- Media Elements (Hidden or Visible) -->
	{#if clip.videoSrc}
		<video
			bind:this={video}
			src={clip.videoSrc}
			class="absolute top-0 left-0 h-full w-full rounded-full object-cover"
			style="transform: scale({clip.scale || 1})"
			preload="none"
			poster={clip.thumbnailSrc}
			playsinline
			ontimeupdate={handleTimeUpdate}
			onended={handleEnded}
		>
			<track kind="captions" />
		</video>
	{:else}
		<audio
			bind:this={audio}
			src={clip.audioSrc}
			preload="none"
			ontimeupdate={handleTimeUpdate}
			onended={handleEnded}
		></audio>
		<img
			src={clip.thumbnailSrc}
			alt={clip.title}
			loading="lazy"
			class="absolute top-0 left-0 h-full w-full rounded-full object-cover"
		/>
	{/if}

	<!-- SVG Overlay -->
	<svg width={size} height={size} class="pointer-events-none absolute top-0 left-0 rotate-[-90deg]">
		<!-- Defs for Gradient -->
		<defs>
			<linearGradient id="gradient-{clip.id}" x1="0%" y1="0%" x2="100%" y2="0%">
				<stop offset="0%" stop-color="var(--color-primary-500)" />
				<stop offset="100%" stop-color="var(--color-secondary-500)" />
			</linearGradient>
		</defs>

		<!-- Background Track -->
		<circle
			cx={size / 2}
			cy={size / 2}
			r={radius}
			fill="none"
			stroke="rgb(var(--color-surface-500) / 0.3)"
			stroke-width={strokeWidth}
		/>

		<!-- Progress Circle -->
		<circle
			cx={size / 2}
			cy={size / 2}
			r={radius}
			fill="none"
			stroke={isViewed && !isPlaying
				? 'rgb(var(--color-surface-400))'
				: `url(#gradient-${clip.id})`}
			stroke-width={strokeWidth}
			stroke-dasharray={circumference}
			stroke-dashoffset={strokeDashoffset}
			stroke-linecap="round"
			class="transition-all duration-100"
		/>
	</svg>

	<!-- Title Overlay (Optional, maybe below?) -->
</div>
<div class="mt-1 w-[100px] truncate text-center text-xs">{clip.title}</div>
