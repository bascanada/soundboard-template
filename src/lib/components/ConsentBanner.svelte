<script>
	import { consentState } from '$lib/state/consent.svelte.js';
	import { fade, fly } from 'svelte/transition';
</script>

{#if !consentState.hasDecided}
	<div
		class="fixed right-0 bottom-0 left-0 z-50 p-4"
		in:fly={{ y: 50, duration: 500, delay: 1000 }}
		out:fade
	>
		<div
			class="mx-auto flex max-w-4xl flex-col items-center justify-between gap-4 rounded-xl bg-surface-800 p-4 text-white shadow-2xl ring-1 ring-white/10 sm:flex-row"
		>
			<div class="text-sm">
				<p class="font-bold">Contribuez au classement ! 🚀</p>
				<p class="opacity-80">
					Acceptez-vous d'envoyer des données anonymes pour aider à déterminer quels clips sont les
					plus populaires ?
				</p>
			</div>

			<div class="flex shrink-0 gap-2">
				<button class="variant-ghost-surface btn btn-sm" onclick={() => consentState.decline()}>
					Non merci
				</button>
				<button
					class="variant-filled-primary btn btn-sm font-bold"
					onclick={() => consentState.accept()}
				>
					C'est parti !
				</button>
			</div>
		</div>
	</div>
{/if}
