<script lang="ts">
	import { SquareLibrary, ArrowLeft } from '@lucide/svelte';

	interface Props {
		variant?: 'home' | 'urls';
	}

	let { variant = 'home' }: Props = $props();
</script>

<header class="w-full p-4 border-b border-[var(--border)]">
	{#if variant === 'home'}
		<a href="/urls" class="text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors" title="View saved URLs">
			<SquareLibrary size={24} />
		</a>
	{:else}
		<a href="/" class="flex items-center gap-3 text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors">
			<ArrowLeft size={24} />
			<span class="font-display font-semibold">Back to Home</span>
		</a>
	{/if}
</header>
