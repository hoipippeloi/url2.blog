<script lang="ts">
	import { Carta, Markdown } from 'carta-md';
	import DOMPurify from 'isomorphic-dompurify';
	import Header from '$lib/components/Header.svelte';
	import { ArrowBigLeftDash, ExternalLink } from '@lucide/svelte';

	interface BlogPost {
		id: string;
		title: string;
		content: string;
		frontmatter: Record<string, unknown>;
		createdAt: Date;
	}

	interface SavedUrlInfo {
		id: string;
		url: string;
		title?: string;
	}

	interface PageData {
		blogPost: BlogPost;
		savedUrl: SavedUrlInfo;
	}

	let { data }: { data: PageData } = $props();

	const carta = new Carta({
		sanitizer: DOMPurify.sanitize,
	});

	function stripFrontmatter(content: string): string {
		// Try standard YAML frontmatter format (---)
		let match = content.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/);
		if (match) {
			return content.slice(match[0].length);
		}

		// Try code block format with closing backticks (```yaml ... ```)
		match = content.match(/^```(?:ya?ml)?\r?\n[\s\S]*?\r?\n```\r?\n?/);
		if (match) {
			return content.slice(match[0].length);
		}

		// Try code block format without closing backticks (```yaml ... until first # heading)
		// This handles malformed frontmatter that starts with ```yaml but has no closing ```
		match = content.match(/^```(?:ya?ml)?\r?\n[\s\S]*?\n(?=#)/);
		if (match) {
			return content.slice(match[0].length);
		}

		return content.trim();
	}

	let contentWithoutFrontmatter = $derived(stripFrontmatter(data.blogPost.content));
</script>

<svelte:head>
	<title>{data.blogPost.title} - URL2.blog</title>
</svelte:head>

<Header />

<main class="pt-16 min-h-screen">
	<section class="max-w-3xl mx-auto px-6 py-12">
		<div class="mb-8">
			<a href="/blog" class="inline-flex items-center gap-2 text-sm text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors">
				<ArrowBigLeftDash size={16} />
				<span>Back to blog</span>
			</a>
		</div>

		<article class="blog-post">
			<header class="blog-post-header">
				<h1 class="blog-post-title">{data.blogPost.title}</h1>
				<div class="blog-post-meta">
					<span class="blog-post-date">
						{new Date(data.blogPost.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
					</span>
					<a
						href={data.savedUrl.url}
						target="_blank"
						rel="noopener noreferrer"
						class="source-link"
					>
						<ExternalLink size={14} />
						<span>Source</span>
					</a>
				</div>
			</header>

			<div class="blog-post-content">
				<Markdown {carta} value={contentWithoutFrontmatter} />
			</div>
		</article>
	</section>
</main>

<style>
	.blog-post {
		background: var(--bg);
		border-radius: 12px;
	}

	.blog-post-header {
		margin-bottom: 2.5rem;
		padding-bottom: 1.5rem;
		border-bottom: 1px solid var(--border);
	}

	.blog-post-title {
		font-size: 2.25rem;
		font-weight: 700;
		line-height: 1.2;
		color: var(--fg);
		margin: 0 0 1rem 0;
		letter-spacing: -0.01em;
	}

	.blog-post-meta {
		display: flex;
		align-items: center;
		gap: 1rem;
		font-size: 0.875rem;
		color: var(--fg-muted);
	}

	.blog-post-date {
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-size: 0.75rem;
		font-weight: 600;
	}

	.source-link {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		color: var(--accent);
		text-decoration: none;
		font-weight: 500;
		transition: opacity 0.2s;
	}

	.source-link:hover {
		opacity: 0.8;
	}

	.blog-post-content {
		font-size: 1.0625rem;
		line-height: 1.8;
		color: var(--fg);
	}

	/* Carta Viewer Styles */
	.blog-post-content :global(.carta-viewer),
	.blog-post-content :global(.markdown-body) {
		font-family: 'Lekton', monospace;
	}

	.blog-post-content :global(h1) {
		font-size: 1.875rem;
		font-weight: 700;
		margin: 2.5rem 0 1.25rem 0;
		padding-bottom: 0.75rem;
		border-bottom: 2px solid var(--border);
		line-height: 1.3;
		color: var(--fg);
	}

	.blog-post-content :global(h2) {
		font-size: 1.5rem;
		font-weight: 600;
		margin: 2rem 0 1rem 0;
		line-height: 1.4;
		color: var(--fg);
	}

	.blog-post-content :global(h3) {
		font-size: 1.25rem;
		font-weight: 600;
		margin: 1.75rem 0 0.75rem 0;
		line-height: 1.4;
		color: var(--fg);
	}

	.blog-post-content :global(h4) {
		font-size: 1.125rem;
		font-weight: 600;
		margin: 1.5rem 0 0.5rem 0;
		line-height: 1.5;
		color: var(--fg);
	}

	.blog-post-content :global(p) {
		margin: 0 0 1.5rem 0;
		line-height: 1.8;
	}

	.blog-post-content :global(ul),
	.blog-post-content :global(ol) {
		margin: 0 0 1.5rem 0;
		padding-left: 1.75rem;
	}

	.blog-post-content :global(ul) {
		list-style-type: disc;
	}

	.blog-post-content :global(ol) {
		list-style-type: decimal;
	}

	.blog-post-content :global(li) {
		margin: 0.5rem 0;
		line-height: 1.7;
	}

	.blog-post-content :global(li::marker) {
		color: var(--accent);
	}

	.blog-post-content :global(code) {
		background: var(--bg-card);
		color: var(--fg);
		padding: 0.2em 0.4em;
		border-radius: 4px;
		font-size: 0.9em;
		font-family: 'JetBrains Mono', monospace;
		font-weight: 500;
	}

	.blog-post-content :global(pre) {
		background: var(--bg-card);
		padding: 1.25rem;
		border-radius: 8px;
		overflow-x: auto;
		margin: 0 0 1.5rem 0;
		border: 1px solid var(--border);
	}

	.blog-post-content :global(pre code) {
		background: none;
		padding: 0;
		font-size: 0.875rem;
		line-height: 1.6;
	}

	.blog-post-content :global(blockquote) {
		border-left: 4px solid var(--accent);
		padding: 0.75rem 0 0.75rem 1.25rem;
		margin: 0 0 1.5rem 0;
		color: var(--fg-muted);
		font-style: italic;
		background: var(--bg-card);
		border-radius: 0 8px 8px 0;
	}

	.blog-post-content :global(blockquote p) {
		margin-bottom: 0;
	}

	.blog-post-content :global(a) {
		color: var(--accent);
		text-decoration: none;
		font-weight: 500;
		border-bottom: 1px solid transparent;
		transition: border-color 0.2s;
	}

	.blog-post-content :global(a:hover) {
		border-bottom-color: var(--accent);
	}

	.blog-post-content :global(img) {
		max-width: 100%;
		height: auto;
		border-radius: 8px;
		margin: 1.5rem 0;
		display: block;
	}

	.blog-post-content :global(hr) {
		border: none;
		border-top: 2px solid var(--border);
		margin: 2.5rem 0;
	}

	.blog-post-content :global(strong) {
		font-weight: 700;
		color: var(--fg);
	}

	.blog-post-content :global(em) {
		font-style: italic;
	}

	.blog-post-content :global(table) {
		width: 100%;
		border-collapse: collapse;
		margin: 1.5rem 0;
	}

	.blog-post-content :global(th),
	.blog-post-content :global(td) {
		padding: 0.75rem 1rem;
		border: 1px solid var(--border);
		text-align: left;
	}

	.blog-post-content :global(th) {
		background: var(--bg-card);
		font-weight: 600;
		color: var(--fg);
	}

	.blog-post-content :global(td) {
		background: var(--bg);
	}
</style>
