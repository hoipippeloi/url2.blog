<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import FeedCard from '$lib/components/FeedCard.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';

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

	interface PageData {
		savedUrls: SavedUrl[];
	}

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Blog Posts - URL2.blog</title>
</svelte:head>

<Header />

<main class="pt-14">
	<section>
		<div class="max-w-[2560px] mx-auto w-full">
			{#if data.savedUrls.length > 0}
				<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 border-t border-x border-zinc-200">
					{#each data.savedUrls as savedUrl}
						<FeedCard {savedUrl} />
					{/each}
				</div>
			{:else}
				<EmptyState
					message="No blog posts yet"
					actionText="Save your first URL"
					actionHref="/"
				/>
			{/if}
		</div>
	</section>
</main>
