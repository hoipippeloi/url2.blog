<script lang="ts">
	import Modal from '$lib/components/Modal.svelte';
	import BlogEditor from '$lib/components/BlogEditor.svelte';
	import Header from '$lib/components/Header.svelte';
	import { CircleAlert, Check } from '@lucide/svelte';

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

	// Modal state
	let modalOpen = $state(false);
	let currentUrlId = $state<string | null>(null);
	let currentUrl = $state<string>('');
	let isGenerating = $state(false);
	
	// Loading states
	let isSavingBlogPost = $state(false);
	
	// Editor state
	let showEditor = $state(false);
	let editorContent = $state('');
	let editorTitle = $state('');
	let editorBlogPostId = $state<string | null>(null);
	let editorSavedUrl = $state<string>('');
	
	// UI state
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

<Header variant="urls" />

<main class="min-h-screen flex flex-col items-center p-4">
	<div class="flex-1 w-full max-w-4xl mx-auto">
		{#if errorMessage}
			<div class="alert alert-error mb-4" role="alert">
				<CircleAlert class="alert-icon" size={20} />
				<div class="alert-content">
					<p class="alert-title">Error</p>
					<p class="alert-message">{errorMessage}</p>
				</div>
				<button class="btn btn-outline btn-sm" onclick={() => errorMessage = null}>
					Dismiss
				</button>
			</div>
		{/if}

		{#if successMessage}
			<div class="alert alert-success mb-4" role="alert">
				<Check class="alert-icon" size={20} />
				<div class="alert-content">
					<p class="alert-message">{successMessage}</p>
				</div>
			</div>
		{/if}

		{#if isGenerating}
			<div class="modal-overlay open">
				<div class="modal">
					<div class="modal-body">
						<div class="space-y-4">
							<h3 class="modal-title">Generating your blog post...</h3>
							<div class="progress-bar-container">
								<div class="progress-track">
									<div
										class="progress-fill"
										style="width: 100%; animation: progress-indeterminate 1.5s infinite;"
									></div>
								</div>
							</div>
							<p class="text-center text-[var(--fg-muted)]">
								This may take up to 30 seconds
							</p>
						</div>
					</div>
				</div>
			</div>
		{/if}

		{#if showEditor && editorBlogPostId}
			<div class="editor-wrapper mb-8">
				<div class="editor-header-bar flex items-center justify-between mb-4">
					<div>
						<h2 class="text-xl font-bold">Edit Blog Post</h2>
						<p class="text-sm text-[var(--fg-muted)]">{editorSavedUrl}</p>
					</div>
					<button class="btn btn-outline btn-sm" onclick={closeEditor}>
						Close Editor
					</button>
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
		{:else}
			<section class="mb-8">
				<h1 class="text-3xl font-display font-bold mb-2">Saved URLs</h1>
				<p class="text-[var(--fg-muted)] mb-6">
					Manage your saved URLs and generated blog posts
				</p>
			</section>

			{#if data.savedUrls.length > 0}
				<section class="space-y-3">
					{#each data.savedUrls as savedUrl}
						<div class="card">
							<div class="card-body">
								<div class="flex items-center justify-between">
									<div class="space-y-1 flex-1 min-w-0">
										<h3 class="card-title truncate">{savedUrl.url}</h3>
										<p class="card-text">
											{#if savedUrl.hasBlogPost}
												<span class="badge badge-success">Generated</span>
											{:else}
												<span class="badge badge-outline">Pending</span>
											{/if}
										</p>
									</div>
									<div class="flex gap-2 ml-4">
										{#if savedUrl.hasBlogPost && savedUrl.latestBlogPost}
											<button
												class="btn btn-primary btn-sm"
												onclick={() => openEditor(
													savedUrl.latestBlogPost!.id,
													savedUrl.latestBlogPost!.title,
													savedUrl.latestBlogPost!.content,
													savedUrl.url
												)}
											>
												Edit
											</button>
										{/if}
										<button
											class="btn btn-outline btn-sm"
											onclick={() => openGenerateModal(savedUrl.id, savedUrl.url)}
										>
											{savedUrl.hasBlogPost ? 'Regenerate' : 'Generate'}
										</button>
									</div>
								</div>
							</div>
						</div>
					{/each}
				</section>
			{:else}
				<div class="text-center py-12">
					<p class="text-[var(--fg-muted)] mb-4">No saved URLs yet</p>
					<a href="/" class="btn btn-primary">
						Save your first URL
					</a>
				</div>
			{/if}
		{/if}
	</div>

	<Modal
		open={modalOpen}
		savedUrlId={currentUrlId}
		onclose={closeModal}
		onsubmit={handleGenerateBlog}
	/>
</main>

<style>
	.editor-wrapper {
		background: var(--bg);
		border-radius: var(--radius-lg);
		padding: 1.5rem;
	}

	.editor-header-bar {
		border-bottom: 1px solid var(--border);
		padding-bottom: 1rem;
	}
</style>