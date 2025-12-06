<script lang="ts">
	import { onMount } from 'svelte';
	import type { Clip } from '$lib/types';

	let { clip, currentPlayingId = $bindable(null) } = $props();

	let audio = $state<HTMLAudioElement>();
	let video = $state<HTMLVideoElement>();
	let isPlaying = $state(false);
	let isViewed = $state(false);
	let progress = $state(0); // 0 to 1
	let duration = $state(0);

	// SVG Config
	const size = 100;
	const strokeWidth = 4;
	const radius = (size - strokeWidth) / 2;
	const circumference = 2 * Math.PI * radius;

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
		
		try {
			if (clip.videoSrc && video) {
				await video.play();
			} else if (audio) {
				await audio.play();
			}
			isPlaying = true;
			isViewed = true;
		} catch (e) {
			console.error("Playback failed", e);
			isPlaying = false;
		}
	}

	function pause() {
		if (!isPlaying) return;
		
		if (clip.videoSrc && video) {
			video.pause();
		} else if (audio) {
			audio.pause();
		}
		isPlaying = false;
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
		if (video) {
			video.currentTime = 0;
		}
	}

	// Calculate stroke dashoffset
	// progress 0 -> offset = circumference
	// progress 1 -> offset = 0
	let strokeDashoffset = $derived(circumference - progress * circumference);
</script>

<div class="relative w-[100px] h-[100px] cursor-pointer" onclick={togglePlay} role="button" tabindex="0" onkeydown={(e) => e.key === 'Enter' && togglePlay()}>
	<!-- Media Elements (Hidden or Visible) -->
	{#if clip.videoSrc}
		<video
			bind:this={video}
			src={clip.videoSrc}
			class="absolute top-0 left-0 w-full h-full rounded-full object-cover"
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
			ontimeupdate={handleTimeUpdate}
			onended={handleEnded}
		></audio>
		<img
			src={clip.thumbnailSrc}
			alt={clip.title}
			class="absolute top-0 left-0 w-full h-full rounded-full object-cover"
		/>
	{/if}

	<!-- SVG Overlay -->
	<svg width={size} height={size} class="absolute top-0 left-0 pointer-events-none rotate-[-90deg]">
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
			stroke="rgba(128,128,128, 0.2)"
			stroke-width={strokeWidth}
		/>

		<!-- Progress Circle -->
		<circle
			cx={size / 2}
			cy={size / 2}
			r={radius}
			fill="none"
			stroke={isViewed && !isPlaying ? "#888" : `url(#gradient-${clip.id})`}
			stroke-width={strokeWidth}
			stroke-dasharray={circumference}
			stroke-dashoffset={strokeDashoffset}
			stroke-linecap="round"
			class="transition-all duration-100"
		/>
	</svg>
	
	<!-- Title Overlay (Optional, maybe below?) -->
</div>
<div class="text-center text-xs mt-1 truncate w-[100px]">{clip.title}</div>
