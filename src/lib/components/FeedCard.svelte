<script lang="ts">
	import { ArrowRight } from '@lucide/svelte';

	interface SavedUrl {
		id: string;
		url: string;
		createdAt: Date;
		hasBlogPost: boolean;
		latestBlogPost?: {
			id: string;
			title: string;
			content: string;
		};
	}

	interface Props {
		savedUrl: SavedUrl;
	}

	let { savedUrl }: Props = $props();

	function formatDate(date: Date): string {
		return new Intl.DateTimeFormat('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		}).format(new Date(date));
	}

	function deriveTitle(item: SavedUrl): string {
		if (item.latestBlogPost?.title) {
			return item.latestBlogPost.title;
		}
		try {
			const urlObj = new URL(item.url);
			const pathParts = urlObj.pathname.split('/').filter(Boolean);
			if (pathParts.length > 0) {
				const lastPart = pathParts[pathParts.length - 1];
				return lastPart.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
			}
			return urlObj.hostname.replace('www.', '');
		} catch {
			return item.url;
		}
	}

	function deriveExcerpt(item: SavedUrl): string {
		if (item.latestBlogPost?.content) {
			const content = item.latestBlogPost.content;
			const text = content.replace(/^---[\s\S]*?---\n/, '');
			const firstLine = text.split('\n').find(l => l.trim() && !l.startsWith('#'));
			if (firstLine) {
				return firstLine.slice(0, 80) + (firstLine.length > 80 ? '...' : '');
			}
		}
		return 'No blog post yet';
	}
</script>

<a href="/blog/{savedUrl.id}" class="feed-card">
	<span class="date-label">{formatDate(savedUrl.createdAt)}</span>
	<h2 class="card-headline">{deriveTitle(savedUrl)}</h2>
	<p class="card-excerpt">{deriveExcerpt(savedUrl)}</p>
	<div class="card-footer">
		<span class="read-more">Read more</span>
		<ArrowRight size={16} class="arrow-icon" />
	</div>
</a>

<style>
	.feed-card {
		display: flex;
		flex-direction: column;
		padding: 1rem;
		background: transparent;
		border: 1px solid var(--border);
		text-decoration: none;
		color: var(--fg);
		min-height: 140px;
		transition: all 0.2s ease;
	}

	.feed-card:hover {
		background: var(--bg-card);
		border-color: var(--border-hover);
	}

	.feed-card:hover .card-headline {
		color: var(--accent);
	}

	.feed-card:hover .card-footer {
		color: var(--accent);
	}

	.feed-card:hover .card-footer :global(svg) {
		transform: translateX(4px);
	}

	.date-label {
		font-size: 0.625rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--fg-muted);
		opacity: 0.7;
	}

	.card-headline {
		font-family: 'Bricolage Grotesque', sans-serif;
		font-size: 0.9375rem;
		font-weight: 600;
		margin-top: 0.5rem;
		margin-bottom: 0.375rem;
		line-height: 1.3;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		transition: color 0.2s ease;
	}

	.card-excerpt {
		font-size: 0.75rem;
		color: var(--fg-muted);
		line-height: 1.5;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.card-footer {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		margin-top: auto;
		padding-top: 0.625rem;
		color: var(--fg-muted);
		font-size: 0.75rem;
		font-weight: 500;
		transition: color 0.2s ease;
	}

	.card-footer :global(svg) {
		flex-shrink: 0;
		transition: transform 0.2s ease;
	}
</style>