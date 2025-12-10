<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import WaveSurfer from 'wavesurfer.js';
	// @ts-ignore
	import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js';
	// @ts-ignore
	import TimelinePlugin from 'wavesurfer.js/dist/plugins/timeline.esm.js';

	let videoElement = $state<HTMLVideoElement>();
	let waveformContainer = $state<HTMLElement>();
	let timelineContainer = $state<HTMLElement>();
	let wavesurfer: any;
	let wsRegions: any;
	let activeRegion: any;

	let videoSrc = $state<string | null>(null);
	let isPlaying = $state(false);
	let zoomLevel = $state(50);

	let startTime = $state(0);
	let endTime = $state(0);

	function handleFileUpload(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file) {
			const url = URL.createObjectURL(file);
			videoSrc = url;
			// WaveSurfer init is handled by onloadedmetadata of video
		}
	}

	function initWaveSurfer() {
		if (wavesurfer) {
			wavesurfer.destroy();
		}

		wavesurfer = WaveSurfer.create({
			container: waveformContainer!,
			waveColor: '#4F46E5', // Indigo-600
			progressColor: '#818CF8', // Indigo-400
			cursorColor: '#312E81', // Indigo-900
			barWidth: 2,
			barGap: 1,
			barRadius: 2,
			height: 100,
			minPxPerSec: zoomLevel,
			media: videoElement!, // Sync with video
			normalize: true,
			plugins: [
				TimelinePlugin.create({
					container: timelineContainer!,
					formatTimeCallback: (seconds: number) => {
						const m = Math.floor(seconds / 60);
						const s = Math.floor(seconds % 60);
						return `${m}:${s.toString().padStart(2, '0')}`;
					}
				}),
				// @ts-ignore
				RegionsPlugin.create({
					dragSelection: true,
					color: 'rgba(79, 70, 229, 0.2)'
				})
			]
		});

		wsRegions = wavesurfer.plugins[1]; // Access Regions plugin

		wsRegions.on('region-updated', (region: any) => {
			activeRegion = region;
			startTime = region.start;
			endTime = region.end;
			// Seek to start of region while dragging/updating, but only if user interaction
			if (wavesurfer && !isProgrammaticUpdate) {
				wavesurfer.setTime(region.start);
			}
		});

		wsRegions.on('region-created', (region: any) => {
			activeRegion = region;
			startTime = region.start;
			endTime = region.end;
		});

		// Initialize default region once ready
		wavesurfer.once('ready', () => {
			wsRegions.clearRegions();
			wsRegions.addRegion({
				start: 0,
				end: Math.min(wavesurfer.getDuration(), 10), // Default to 10s or full duration
				color: 'rgba(79, 70, 229, 0.2)',
				drag: true,
				resize: true
			});
			// Update initial state
			const r = wsRegions.getRegions()[0];
			if (r) {
				activeRegion = r; // Ensure activeRegion is set initially
				startTime = r.start;
				endTime = r.end;
			}
		});

		wavesurfer.on('play', () => (isPlaying = true));
		wavesurfer.on('pause', () => (isPlaying = false));
	}

	function togglePlay() {
		if (wavesurfer) {
			wavesurfer.playPause();
		}
	}

	function handleZoom(event: Event) {
		const target = event.target as HTMLInputElement;
		zoomLevel = Number(target.value);
		if (wavesurfer) {
			wavesurfer.zoom(zoomLevel);
		}
	}

	function playRegion() {
		if (activeRegion) {
			activeRegion.play();
		} else {
			togglePlay();
		}
	}

	let isProgrammaticUpdate = $state(false);

	function setInPoint() {
		if (!activeRegion && wsRegions) {
			activeRegion = wsRegions.getRegions()[0]; // Fallback
		}
		if (activeRegion && wavesurfer) {
			const currentTime = wavesurfer.getCurrentTime();
			if (currentTime < activeRegion.end) {
				isProgrammaticUpdate = true;
				activeRegion.setOptions({ start: currentTime });
				startTime = currentTime; // Manually update state
				isProgrammaticUpdate = false;
			} else {
				// If new start is after current end, move the whole region
				const duration = activeRegion.end - activeRegion.start;
				const newEnd = Math.min(currentTime + duration, wavesurfer.getDuration());

				isProgrammaticUpdate = true;
				activeRegion.setOptions({
					start: currentTime,
					end: newEnd
				});
				startTime = currentTime;
				endTime = newEnd;
				isProgrammaticUpdate = false;
			}
		}
	}

	function setOutPoint() {
		if (!activeRegion && wsRegions) {
			activeRegion = wsRegions.getRegions()[0]; // Fallback
		}
		if (activeRegion && wavesurfer) {
			const currentTime = wavesurfer.getCurrentTime();
			if (currentTime > activeRegion.start) {
				isProgrammaticUpdate = true;
				activeRegion.setOptions({ end: currentTime });
				endTime = currentTime; // Manually update state
				isProgrammaticUpdate = false;
			}
		}
	}

	function updateRegionFromInputs() {
		if (activeRegion && wavesurfer) {
			const duration = wavesurfer.getDuration();
			const start = Math.max(0, Math.min(startTime, duration));
			const end = Math.max(start, Math.min(endTime, duration));

			isProgrammaticUpdate = true;
			activeRegion.setOptions({ start, end });
			startTime = start;
			endTime = end;

			// Optional: Seek to start if modifying start
			wavesurfer.setTime(start);

			isProgrammaticUpdate = false;
		}
	}

	function formatTime(seconds: number): string {
		if (!isFinite(seconds) || isNaN(seconds)) return '0:00';
		const m = Math.floor(seconds / 60);
		const s = Math.floor(seconds % 60);
		const ms = Math.round((seconds % 1) * 1000);

		const sStr = s.toString().padStart(2, '0');
		// Minimize decimal places if 0
		if (ms === 0) return `${m}:${sStr}`;
		return `${m}:${sStr}.${ms.toString().padStart(3, '0').replace(/0+$/, '')}`;
	}

	function parseTime(timeString: string): number {
		if (!timeString) return 0;
		// Normalize comma to dot
		const cleanStr = timeString.trim().replace(',', '.');
		const parts = cleanStr.split(':');

		let seconds = 0;
		if (parts.length === 3) {
			// H:M:S
			seconds = parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseFloat(parts[2]);
		} else if (parts.length === 2) {
			// M:S
			seconds = parseInt(parts[0]) * 60 + parseFloat(parts[1]);
		} else if (parts.length === 1) {
			// S
			seconds = parseFloat(parts[0]);
		}
		return isNaN(seconds) ? 0 : seconds;
	}

	function updateStartFromInput(e: Event) {
		const input = e.target as HTMLInputElement;
		const val = parseTime(input.value);
		const duration = wavesurfer ? wavesurfer.getDuration() : Infinity;
		const start = Math.max(0, Math.min(val, duration));

		if (activeRegion) {
			isProgrammaticUpdate = true;
			// If new start > end, push end OR clamp?
			// Previous logic clamped. Let's clamp start to end for safety or push end?
			// User prefers pushing end usually, but for direct text input, let's keep it simple:
			// If start > end, we might want to update end to start + 0.1?
			// Actually, let's reuse setInPoint logic if needed, but for text input, precision is key.
			// Let's just constrain.
			const currentEnd = activeRegion.end;
			const finalStart = Math.min(start, currentEnd);
			// OR allow crossing and swap? No, standard is clamp.

			activeRegion.setOptions({ start: finalStart });
			startTime = finalStart;
			if (wavesurfer && !isPlaying) wavesurfer.setTime(finalStart);
			isProgrammaticUpdate = false;

			// Force input update to formatted value in case of clamp
			input.value = formatTime(finalStart);
		}
	}

	function updateEndFromInput(e: Event) {
		const input = e.target as HTMLInputElement;
		const val = parseTime(input.value);
		const duration = wavesurfer ? wavesurfer.getDuration() : Infinity;
		const end = Math.max(0, Math.min(val, duration));

		if (activeRegion) {
			isProgrammaticUpdate = true;
			const currentStart = activeRegion.start;
			const finalEnd = Math.max(end, currentStart);

			activeRegion.setOptions({ end: finalEnd });
			endTime = finalEnd;
			isProgrammaticUpdate = false;

			input.value = formatTime(finalEnd);
		}
	}

	function copyToClipboard(value: number) {
		const text = formatTime(value);
		navigator.clipboard.writeText(text).then(() => {
			console.log('Copied:', text);
		});
	}

	function copyPair() {
		const text = `${formatTime(startTime)}|${formatTime(endTime)}`;
		navigator.clipboard.writeText(text).then(() => {
			console.log('Copied Pair:', text);
		});
	}

	async function pastePair() {
		try {
			const text = await navigator.clipboard.readText();
			if (!text || !text.includes('|')) return;

			const [startStr, endStr] = text.split('|');
			const start = parseTime(startStr);
			const end = parseTime(endStr);

			if (activeRegion && wavesurfer) {
				// Validate
				const duration = wavesurfer.getDuration();
				const s = Math.max(0, Math.min(start, duration));
				const e = Math.max(s, Math.min(end, duration));

				isProgrammaticUpdate = true;
				activeRegion.setOptions({ start: s, end: e });
				startTime = s;
				endTime = e;
				wavesurfer.setTime(s);
				isProgrammaticUpdate = false;
			}
		} catch (err) {
			console.error('Failed to paste:', err);
		}
	}

	import { page } from '$app/stores';

	// Clean up object URL and init
	$effect(() => {
		// Read URL params
		const params = new URLSearchParams(window.location.search);
		const initialStart = params.get('start');
		const initialEnd = params.get('end');

		if ((initialStart || initialEnd) && wavesurfer) {
			wavesurfer.once('ready', () => {
				setTimeout(() => {
					if (activeRegion) {
						isProgrammaticUpdate = true;
						const start = initialStart ? parseTime(initialStart) : activeRegion.start;
						const end = initialEnd ? parseTime(initialEnd) : activeRegion.end;

						// Ensure valid range
						const finalStart = Math.min(start, end);
						const finalEnd = Math.max(start, end);

						activeRegion.setOptions({ start: finalStart, end: finalEnd });
						startTime = finalStart;
						endTime = finalEnd;
						wavesurfer.setTime(finalStart);
						isProgrammaticUpdate = false;
					}
				}, 50);
			});
		}

		return () => {
			if (videoSrc) URL.revokeObjectURL(videoSrc);
			if (wavesurfer) wavesurfer.destroy();
		};
	});
</script>

<div class="flex h-screen w-full flex-col overflow-hidden bg-surface-900">
	<!-- File Upload -->
	{#if !videoSrc}
		<div class="flex flex-1 flex-col items-center justify-center p-4">
			<div
				class="flex w-full max-w-lg flex-col items-center justify-center gap-4 card border-2 border-dashed border-surface-500/30 p-10 text-center transition-all hover:border-primary-500/50"
			>
				<div class="bg-surface-100-800-token rounded-full p-6 shadow-lg">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="48"
						height="48"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="opacity-75"
						><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline
							points="17 8 12 3 7 8"
						/><line x1="12" x2="12" y1="3" y2="15" /></svg
					>
				</div>
				<div class="space-y-2">
					<h3 class="h3 font-bold">Upload a video</h3>
					<p class="mx-auto max-w-sm opacity-75">
						Select a local video file to start editing. The video stays on your device.
					</p>
				</div>
				<input
					type="file"
					accept="video/*"
					id="video-upload"
					onchange={handleFileUpload}
					class="hidden"
				/>
				<label for="video-upload" class="variant-filled-primary btn cursor-pointer"
					>Select File</label
				>
			</div>
		</div>
	{:else}
		<!-- Editor Area -->
		<div class="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col gap-4 p-4">
			<!-- Video Player (Flexible height) -->
			<div
				class="relative min-h-0 w-full flex-1 overflow-hidden rounded-xl border border-surface-500/10 bg-black shadow-2xl"
			>
				<!-- svelte-ignore a11y_media_has_caption -->
				<video
					bind:this={videoElement}
					src={videoSrc}
					onloadedmetadata={initWaveSurfer}
					onclick={togglePlay}
					class="h-full w-full cursor-pointer object-contain"
				></video>

				<!-- Overlay Play Button if Paused -->
				{#if !isPlaying}
					<button
						class="absolute inset-0 flex h-full w-full cursor-pointer items-center justify-center border-none bg-black/20 p-0"
						onclick={togglePlay}
						aria-label="Play Video"
					>
						<div
							class="rounded-full bg-white/20 p-4 backdrop-blur-sm transition-transform hover:scale-110"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="32"
								height="32"
								viewBox="0 0 24 24"
								fill="white"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg
							>
						</div>
					</button>
				{/if}
			</div>

			<!-- Waveform & Controls (Fixed/Shrinkable) -->
			<div class="w-full shrink-0 space-y-4 card border border-surface-500/10 p-4 shadow-lg">
				<!-- Timeline -->
				<div bind:this={timelineContainer} class="h-6 w-full text-xs opacity-75"></div>

				<!-- Waveform -->
				<div bind:this={waveformContainer} class="w-full"></div>

				<!-- Controls Toolbar -->
				<div
					class="flex flex-wrap items-center justify-between gap-4 border-t border-surface-500/10 pt-4"
				>
					<!-- Transport -->
					<div class="flex gap-2">
						<button
							class="variant-filled-primary btn-icon"
							onclick={togglePlay}
							title={isPlaying ? 'Pause' : 'Play'}
							aria-label={isPlaying ? 'Pause' : 'Play'}
						>
							{#if isPlaying}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="20"
									height="20"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									><rect x="6" y="4" width="4" height="16" /><rect
										x="14"
										y="4"
										width="4"
										height="16"
									/></svg
								>
							{:else}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="20"
									height="20"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg
								>
							{/if}
						</button>
						<button
							class="variant-soft btn-icon"
							onclick={playRegion}
							title="Loop Selection"
							aria-label="Loop Selection"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
								><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path
									d="M3 3v5h5"
								/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" /><path
									d="M16 21h5v-5"
								/></svg
							>
						</button>
						<div class="mx-2 h-6 w-px bg-surface-500/20"></div>
						<button
							class="variant-soft btn-icon"
							onclick={setInPoint}
							title="Set Start to Current Time"
							aria-label="Set Start to Current Time"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
								><path d="M4 6v12" /><path d="M20 6v12" /><path d="M4 12h16" /><path
									d="M20 12l-4-4"
								/><path d="M20 12l-4 4" /></svg
							>
						</button>
						<button
							class="variant-soft btn-icon"
							onclick={setOutPoint}
							title="Set End to Current Time"
							aria-label="Set End to Current Time"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
								><path d="M4 6v12" /><path d="M20 6v12" /><path d="M4 12h16" /><path
									d="M4 12l4-4"
								/><path d="M4 12l4 4" /></svg
							>
						</button>
					</div>

					<!-- Time Stats & Editors -->
					<div
						class="rounded-token flex flex-wrap items-center gap-4 bg-surface-500/10 px-4 py-2 font-mono text-sm"
					>
						<div class="flex flex-col items-center gap-1">
							<span class="text-[10px] tracking-wider uppercase opacity-50">Start</span>
							<div class="flex items-center gap-1">
								<input
									type="text"
									value={formatTime(startTime)}
									onchange={updateStartFromInput}
									class="input h-6 w-24 px-1 py-0 text-center text-sm"
								/>
								<button
									class="variant-soft btn-icon btn-icon-sm"
									onclick={() => copyToClipboard(startTime)}
									title="Copy Start Time"
									aria-label="Copy Start Time"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="14"
										height="14"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
										><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path
											d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
										/></svg
									>
								</button>
							</div>
						</div>
						<div class="h-8 w-px bg-surface-500/20"></div>
						<div class="flex flex-col items-center gap-1">
							<span class="text-[10px] tracking-wider uppercase opacity-50">End</span>
							<div class="flex items-center gap-1">
								<input
									type="text"
									value={formatTime(endTime)}
									onchange={updateEndFromInput}
									class="input h-6 w-24 px-1 py-0 text-center text-sm"
								/>
								<button
									class="variant-soft btn-icon btn-icon-sm"
									onclick={() => copyToClipboard(endTime)}
									title="Copy End Time"
									aria-label="Copy End Time"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="14"
										height="14"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
										><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path
											d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
										/></svg
									>
								</button>
							</div>
						</div>
						<div class="h-8 w-px bg-surface-500/20"></div>
						<div class="flex flex-col items-center text-primary-500">
							<span class="text-[10px] tracking-wider uppercase opacity-50">Duration</span>
							<span class="font-bold">{(endTime - startTime).toFixed(3)}s</span>
						</div>
						<div class="h-8 w-px bg-surface-500/20"></div>
						<div class="flex items-center gap-2">
							<button
								class="variant-filled-secondary btn btn-sm"
								onclick={copyPair}
								title="Copy Start & End"
							>
								<span>Copy Pair</span>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="14"
									height="14"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path
										d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
									/></svg
								>
							</button>
							<button
								class="variant-ringed-secondary btn btn-sm"
								onclick={pastePair}
								title="Paste Start & End from CMS"
							>
								<span>Paste Pair</span>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="14"
									height="14"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									><path
										d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"
									/><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /></svg
								>
							</button>
						</div>
					</div>

					<!-- Zoom -->
					<div class="flex min-w-[200px] items-center gap-2">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="opacity-50"
							><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line
								x1="8"
								y1="11"
								x2="14"
								y2="11"
							/></svg
						>
						<input
							type="range"
							min="10"
							max="200"
							step="10"
							value={zoomLevel}
							oninput={handleZoom}
							class="range range-sm accent-primary-500"
						/>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="opacity-50"
							><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line
								x1="11"
								y1="8"
								x2="11"
								y2="14"
							/><line x1="8" y1="11" x2="14" y2="11" /></svg
						>
					</div>

					<button
						class="variant-soft-error btn btn-sm"
						onclick={() => {
							videoSrc = null;
							if (wavesurfer) wavesurfer.destroy();
						}}
					>
						Close
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>
