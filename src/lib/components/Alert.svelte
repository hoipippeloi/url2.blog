<script lang="ts">
	import type { Snippet } from 'svelte';

	type AlertType = 'error' | 'success';

	interface Props {
		type?: AlertType;
		message?: string;
		title?: string;
		dismissible?: boolean;
		onDismiss?: () => void;
		children?: Snippet;
	}

	let {
		type = 'error',
		message = '',
		title,
		dismissible = true,
		onDismiss,
		children
	}: Props = $props();

	let isVisible = $state(true);

	function dismiss() {
		isVisible = false;
		onDismiss?.();
	}

	let iconPath = $derived(type === 'error'
		? '<circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />'
		: '<polyline points="20 6 9 17 4 12" />');

	let colorClasses = $derived(type === 'error'
		? 'bg-red-50 border-red-200 text-red-700'
		: 'bg-green-50 border-green-200 text-green-700');

	let iconColor = $derived(type === 'error' ? 'text-red-500' : 'text-green-500');
</script>

{#if isVisible}
	<div
		role="alert"
		class="glass-panel border rounded-lg shadow-lg px-4 py-3 flex items-center gap-3 {colorClasses} {children === undefined ? 'fixed top-20 left-1/2 -translate-x-1/2 z-50' : ''}"
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
			class={iconColor}
		>
			{@html iconPath}
		</svg>
		<div class="flex items-center gap-3 flex-1">
			{#if title}
				<div class="flex flex-col">
					<p class="font-medium">{title}</p>
					<p>{message}</p>
				</div>
			{:else}
				<p class="font-medium">{message}</p>
			{/if}
			{@render children?.()}
		</div>
		{#if dismissible}
			<button
				class={`${type === 'error' ? 'text-red-500 hover:text-red-700' : 'text-green-500 hover:text-green-700'} ml-2`}
				onclick={dismiss}
				aria-label="Dismiss alert"
			>
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
				>
					<line x1="18" y1="6" x2="6" y2="18" />
					<line x1="6" y1="6" x2="18" y2="18" />
				</svg>
			</button>
		{/if}
	</div>
{/if}
