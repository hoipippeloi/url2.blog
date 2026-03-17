<script lang="ts">
	interface BlogPost {
		id: string;
		title: string;
		content: string;
	}

	interface SavedUrl {
		id: string;
		url: string;
		createdAt: Date;
		hasBlogPost: boolean;
		latestBlogPost?: BlogPost;
	}

	interface Props {
		savedUrl: SavedUrl;
		onEdit?: (blogPostId: string, title: string, content: string, url: string) => void;
		onRegenerate?: (urlId: string, url: string) => void;
		onDelete?: (urlId: string) => void;
		isDeleting?: boolean;
	}

	let { savedUrl, onEdit, onRegenerate, onDelete, isDeleting = false }: Props = $props();
</script>

<article class="p-6 border-r border-b border-zinc-200 hover:bg-zinc-50 transition-colors duration-200 group flex flex-col cursor-pointer relative">
	{#if onDelete}
		<button
			class="absolute top-4 right-4 p-1.5 rounded-md hover:bg-red-50 transition-colors cursor-pointer text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100"
			onclick={(e) => {
				e.stopPropagation();
				onDelete(savedUrl.id);
			}}
			disabled={isDeleting}
			title="Delete URL"
			aria-label="Delete URL"
		>
			{#if isDeleting}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="18"
					height="18"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="animate-spin"
				>
					<circle cx="12" cy="12" r="10" stroke-opacity="0.25" />
					<path d="M12 2a10 10 0 0 1 10 10" stroke-opacity="1" />
				</svg>
			{:else}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="18"
					height="18"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<polyline points="3 6 5 6 21 6" />
					<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
					<line x1="10" y1="11" x2="10" y2="17" />
					<line x1="14" y1="11" x2="14" y2="17" />
				</svg>
			{/if}
		</button>
	{/if}

	<span class="text-xs font-medium text-zinc-400 uppercase tracking-widest">
		{new Date(savedUrl.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
	</span>

	<h2 class="text-base font-semibold tracking-tight mt-2 mb-2 group-hover:text-zinc-600 transition-colors line-clamp-1">
		{savedUrl.url.replace(/^https?:\/\//, '').split('/')[0]}
	</h2>

	{#if savedUrl.hasBlogPost}
		<p class="text-zinc-500 text-xs font-light leading-relaxed grow line-clamp-2">
			{savedUrl.latestBlogPost?.title || 'Blog post generated'}
		</p>
	{/if}

	<div class="mt-4 flex items-center gap-2">
		{#if savedUrl.hasBlogPost && savedUrl.latestBlogPost && onEdit}
			<button
				class="text-xs font-medium text-zinc-400 group-hover:text-zinc-900 transition-colors flex items-center gap-1"
				onclick={() => onEdit(
					savedUrl.latestBlogPost!.id,
					savedUrl.latestBlogPost!.title,
					savedUrl.latestBlogPost!.content,
					savedUrl.url
				)}
			>
				<span>Edit</span>
				<span class="iconify" data-icon="mdi:pencil"></span>
			</button>
			<span class="text-zinc-300">|</span>
		{/if}

		{#if onRegenerate}
			<button
				class="text-xs font-medium text-zinc-400 group-hover:text-zinc-900 transition-colors flex items-center gap-1"
				onclick={() => onRegenerate(savedUrl.id, savedUrl.url)}
			>
				<span>{savedUrl.hasBlogPost ? 'Regenerate' : 'Generate'}</span>
				<span class="iconify" data-icon="mdi:refresh"></span>
			</button>
		{/if}
	</div>
</article>
