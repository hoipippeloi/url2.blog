<script lang="ts">
	import Modal from '$lib/components/Modal.svelte';
	import BlogEditor from '$lib/components/BlogEditor.svelte';
	import Header from '$lib/components/Header.svelte';

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

	let modalOpen = $state(false);
	let currentUrlId = $state<string | null>(null);
	let currentUrl = $state<string>('');
	let isGenerating = $state(false);

	let isSavingBlogPost = $state(false);

	let showEditor = $state(false);
	let editorContent = $state('');
	let editorTitle = $state('');
	let editorBlogPostId = $state<string | null>(null);
	let editorSavedUrl = $state('');

	let errorMessage = $state<string | null>(null);
	let successMessage = $state<string | null>(null);

	// Parse SvelteKit's serialized form data with indexed references
	function parseFormDataResponse<T>(result: { type: string; status: number; data: string | T }): T | null {
		let data = result.data;
		if (typeof data === 'string') {
			const parsed = JSON.parse(data);
			if (Array.isArray(parsed) && parsed.length >= 3 && typeof parsed[2] === 'object' && parsed[2] !== null) {
				const obj = parsed[2] as Record<string, number>;
				const resolved: Record<string, unknown> = {};
				for (const [key, index] of Object.entries(obj)) {
					resolved[key] = parsed[index as number];
				}
				return resolved as T;
			}
			return parsed as T;
		}
		return data;
	}

	$effect(() => {
		if (errorMessage) {
			const timer = setTimeout(() => {
				errorMessage = null;
			}, 5000);
			return () => clearTimeout(timer);
		}
	});

	$effect(() => {
		if (successMessage) {
			const timer = setTimeout(() => {
				successMessage = null;
			}, 3000);
			return () => clearTimeout(timer);
		}
	});

	function openGenerateModal(urlId: string, url: string) {
		currentUrlId = urlId;
		currentUrl = url;
		modalOpen = true;
	}

	function closeModal() {
		modalOpen = false;
		currentUrlId = null;
		currentUrl = '';
	}

	function openEditor(blogPostId: string, title: string, content: string, url: string) {
		editorBlogPostId = blogPostId;
		editorTitle = title;
		editorContent = content;
		editorSavedUrl = url;
		showEditor = true;
	}

	function closeEditor() {
		showEditor = false;
		editorBlogPostId = null;
		editorTitle = '';
		editorContent = '';
		editorSavedUrl = '';
	}

	async function handleGenerateBlog(formData: FormData) {
		isGenerating = true;
		closeModal();

		try {
			const response = await fetch('?/generateBlog', {
				method: 'POST',
				body: formData,
			});
			const result = await response.json();

			const data = parseFormDataResponse<{ id?: string; title?: string; content?: string; error?: string }>(result);

			isGenerating = false;

			if (result.type === 'success' && data) {
				openEditor(
					data.id || '',
					data.title || '',
					data.content || '',
					currentUrl
				);
			} else if (result.status >= 400 && data?.error) {
				errorMessage = data.error;
			}
		} catch (err) {
			isGenerating = false;
			errorMessage = 'Failed to generate blog post. Please try again.';
		}
	}
</script>

<svelte:head>
	<title>Saved URLs - URL2.blog</title>
</svelte:head>

<Header />

{#if errorMessage}
	<div class="fixed top-20 left-1/2 -translate-x-1/2 z-50" role="alert">
		<div class="glass-panel bg-red-50 border border-red-200 rounded-lg shadow-lg px-4 py-3 flex items-center gap-3">
			<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-red-500">
				<circle cx="12" cy="12" r="10"/>
				<line x1="12" y1="8" x2="12" y2="12"/>
				<line x1="12" y1="16" x2="12.01" y2="16"/>
			</svg>
			<p class="text-red-700 font-medium">{errorMessage}</p>
			<button class="text-red-500 hover:text-red-700 ml-2" onclick={() => errorMessage = null}>
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<line x1="18" y1="6" x2="6" y2="18"/>
					<line x1="6" y1="6" x2="18" y2="18"/>
				</svg>
			</button>
		</div>
	</div>
{/if}

{#if successMessage}
	<div class="fixed top-20 left-1/2 -translate-x-1/2 z-50" role="alert">
		<div class="glass-panel bg-green-50 border border-green-200 rounded-lg shadow-lg px-4 py-3 flex items-center gap-3">
			<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-500">
				<polyline points="20 6 9 17 4 12"/>
			</svg>
			<p class="text-green-700 font-medium">{successMessage}</p>
		</div>
	</div>
{/if}

{#if isGenerating}
	<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
		<div class="bg-white rounded-xl shadow-2xl p-8 max-w-sm mx-4">
			<h3 class="text-xl font-semibold text-zinc-900 mb-4">Generating your blog post...</h3>
			<div class="w-full bg-zinc-100 rounded-full h-2 overflow-hidden">
				<div class="h-full bg-zinc-900 animate-pulse" style="width: 100%;"></div>
			</div>
			<p class="text-sm text-zinc-500 mt-4">
				This may take up to 30 seconds
			</p>
		</div>
	</div>
{/if}

{#if showEditor && editorBlogPostId}
	<div class="pt-16 min-h-screen bg-zinc-50">
		<div class="max-w-4xl mx-auto p-6">
			<div class="bg-white rounded-xl shadow-sm border border-zinc-200 mb-4">
				<div class="flex items-center justify-between p-4 border-b border-zinc-200">
					<div>
						<h2 class="text-xl font-semibold text-zinc-900">Edit Blog Post</h2>
						<p class="text-sm text-zinc-500">{editorSavedUrl}</p>
					</div>
					<button class="text-sm text-zinc-500 hover:text-zinc-900 transition-colors" onclick={closeEditor}>
						Close Editor
					</button>
				</div>
			</div>
			<BlogEditor
				content={editorContent}
				title={editorTitle}
				savedUrlId={currentUrlId}
				isSaving={isSavingBlogPost}
				onSave={async (data) => {
					const formData = new FormData();
					formData.append('blogPostId', editorBlogPostId || '');
					formData.append('title', data.title);
					formData.append('content', data.content);

					isSavingBlogPost = true;
					try {
						const response = await fetch('?/saveBlogPost', {
							method: 'POST',
							body: formData,
						});

						if (response.ok) {
							successMessage = 'Blog post saved successfully!';
							editorContent = data.content;
							editorTitle = data.title;
						} else {
							errorMessage = 'Failed to save changes';
						}
					} catch (err) {
						errorMessage = 'Failed to save changes';
					} finally {
						isSavingBlogPost = false;
					}
				}}
				onCancel={closeEditor}
			/>
		</div>
	</div>
{:else}
	<main class="pt-14">
		<section>
			<div class="max-w-[2560px] mx-auto w-full">
				{#if data.savedUrls.length > 0}
					<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 border-t border-x border-zinc-200">
						{#each data.savedUrls as savedUrl}
							<article class="p-6 border-r border-b border-zinc-200 hover:bg-zinc-50 transition-colors duration-200 group flex flex-col">
								<span class="text-xs font-medium text-zinc-400 uppercase tracking-widest">
									{new Date(savedUrl.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
								</span>
								<h2 class="text-base font-semibold tracking-tight mt-2 mb-2 group-hover:text-zinc-600 transition-colors line-clamp-1">
									{savedUrl.url.replace(/^https?:\/\//, '').split('/')[0]}
								</h2>
								{#if savedUrl.hasBlogPost}
									<p class="text-zinc-500 text-xs font-light leading-relaxed line-clamp-2 flex-grow">
										{savedUrl.latestBlogPost?.title || 'Blog post generated'}
									</p>
								{/if}
								<div class="mt-4 flex items-center gap-2">
									{#if savedUrl.hasBlogPost && savedUrl.latestBlogPost}
										<button
											class="text-xs font-medium text-zinc-400 group-hover:text-zinc-900 transition-colors flex items-center gap-1"
											onclick={() => openEditor(
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
									<button
										class="text-xs font-medium text-zinc-400 group-hover:text-zinc-900 transition-colors flex items-center gap-1"
										onclick={() => openGenerateModal(savedUrl.id, savedUrl.url)}
									>
										<span>{savedUrl.hasBlogPost ? 'Regenerate' : 'Generate'}</span>
										<span class="iconify" data-icon="mdi:refresh"></span>
									</button>
								</div>
							</article>
						{/each}
					</div>
				{:else}
					<div class="flex-1 flex items-center justify-center">
						<div class="text-center py-12 px-4">
							<div class="w-16 h-16 bg-zinc-100 rounded-xl mx-auto mb-4 flex items-center justify-center">
								<span class="iconify text-3xl text-zinc-400" data-icon="mdi:link-variant"></span>
							</div>
							<p class="text-zinc-500 mb-4">No saved URLs yet</p>
							<a href="/" class="inline-flex items-center gap-2 text-sm font-medium text-zinc-900 hover:text-zinc-600 transition-colors">
								<span>Save your first URL</span>
								<span class="iconify" data-icon="mdi:arrow-right"></span>
							</a>
						</div>
					</div>
				{/if}
			</div>
		</section>
	</main>
{/if}

<Modal
	open={modalOpen}
	savedUrlId={currentUrlId}
	onclose={closeModal}
	onsubmit={handleGenerateBlog}
/>

<style>
	.glass-panel {
		background: rgba(255, 255, 255, 0.8);
		backdrop-filter: blur(12px);
	}
</style>
