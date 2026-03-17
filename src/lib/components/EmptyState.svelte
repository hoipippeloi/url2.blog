<script lang="ts">
	interface EmptyStateProps {
		icon?: string;
		message: string;
		actionText?: string;
		actionHref?: string;
		class?: string;
	}

	let {
		icon = 'mdi:link-variant',
		message,
		actionText,
		actionHref = '/',
		class: className = ''
	}: EmptyStateProps = $props();
</script>

<div class="flex-1 flex items-center justify-center {className}">
	<div class="text-center py-12 px-4">
		<div class="w-16 h-16 bg-zinc-100 rounded-xl mx-auto mb-4 flex items-center justify-center">
			<span class="iconify text-3xl text-zinc-400" data-icon={icon}></span>
		</div>
		<p class="text-zinc-500 mb-4">{message}</p>
		{#if actionText && actionHref}
			<a
				href={actionHref}
				class="inline-flex items-center gap-2 text-sm font-medium text-zinc-900 hover:text-zinc-600 transition-colors"
			>
				<span>{actionText}</span>
				<span class="iconify" data-icon="mdi:arrow-right"></span>
			</a>
		{/if}
	</div>
</div>
