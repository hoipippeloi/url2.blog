<script lang="ts">
	import Modal from '$lib/components/Modal.svelte';
	import BlogEditor from '$lib/components/BlogEditor.svelte';
	import Header from '$lib/components/Header.svelte';
	import { CircleAlert, Check, Loader2, Clipboard } from '@lucide/svelte';

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
	let isSavingUrl = $state(false);
	let isSavingBlogPost = $state(false);
	
	// Form state
	let urlInput = $state('');

	// Editor state
	let showEditor = $state(false);
	let editorContent = $state('');
	let editorTitle = $state('');
	let editorBlogPostId = $state<string | null>(null);
	let editorSavedUrl = $state<string>('');

	// UI state
	let errorMessage = $state<string | null>(null);
	let successMessage = $state<string | null>(null);
	let isPasting = $state(false);

	$effect(() => {
		async function autoPasteUrl() {
			try {
				const text = await navigator.clipboard.readText();
				if (text && (text.startsWith('http://') || text.startsWith('https://'))) {
					urlInput = text;
				}
			} catch (err) {
				// Clipboard access may be denied or not available
				console.log('Could not access clipboard:', err);
			}
		}
		autoPasteUrl();
	});

	async function handlePaste() {
		try {
			isPasting = true;
			const text = await navigator.clipboard.readText();
			urlInput = text;
		} catch (err) {
			console.error('Failed to read clipboard:', err);
		} finally {
			isPasting = false;
		}
	}

	// Parse SvelteKit's serialized form data with indexed references
	function parseFormDataResponse<T>(result: { type: string; status: number; data: string | T }): T | null {
		let data = result.data;
		if (typeof data === 'string') {
			const parsed = JSON.parse(data);
			// SvelteKit serializes as [meta, type, obj, values...]
			// where obj values are indices pointing to positions in the array
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

	function openGenerateModal(urlId: string | null, url: string) {
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

	async function handleSaveUrl(formData: FormData) {
		try {
			const response = await fetch('?/saveUrl', {
				method: 'POST',
				body: formData,
			});
			const result = await response.json();

			const data = parseFormDataResponse<{ id?: string; url?: string; exists?: boolean; error?: string }>(result);

			if (result.type === 'success' && data) {
				if (data.exists) {
					errorMessage = 'This URL already exists in your collection';
				} else if (data.id && data.url) {
					openGenerateModal(data.id, data.url);
				}
			} else if (result.status >= 400 && data?.error) {
				errorMessage = data.error;
			}
		} catch (err) {
			errorMessage = 'Failed to save URL. Please try again.';
		}
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
	<title>URL2.blog - Transform URLs into Blog Posts</title>
</svelte:head>

<Header variant="home" />

<main class="min-h-screen flex flex-col items-center p-4">
	<div class="flex-1 flex flex-col items-center w-full max-w-2xl">
		{#if errorMessage}
			<div class="alert alert-error" role="alert">
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
			<div class="alert alert-success" role="alert">
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
			<div class="editor-wrapper w-full max-w-4xl mx-auto mt-8">
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
			<section class="container">
				<form method="POST" action="?/saveUrl" class="space-y-4" onsubmit={(e) => {
					e.preventDefault();
					const formData = new FormData(e.currentTarget);
					isSavingUrl = true;
					handleSaveUrl(formData).finally(() => {
						isSavingUrl = false;
					});
				}}>
					<div class="input-group text-center" style="margin-top: 25vh;">
						<label class="input-label" for="url-input">
							Paste your URL
						</label>
						<div class="input-wrapper">
							<input
								id="url-input"
								type="url"
								name="url"
								class="input-field"
								placeholder="https://example.com"
								autocomplete="off"
								required
								disabled={isSavingUrl}
								bind:value={urlInput}
							/>
							<button
								type="button"
								class="paste-button"
								onclick={handlePaste}
								disabled={isSavingUrl || isPasting}
								title="Paste from clipboard"
							>
								{#if isPasting}
									<Loader2 size={16} class="spinner-icon" />
								{:else}
									<Clipboard size={16} />
								{/if}
							</button>
						</div>
						<div class="input-hint">
							Paste any URL you want to write about
						</div>
					</div>

					<div class="center-button">
						<button type="submit" class="btn btn-primary" disabled={isSavingUrl}>
							{#if isSavingUrl}
								<Loader2 size={16} class="spinner-icon" />
								Saving...
							{:else}
								Save
							{/if}
						</button>
					</div>
				</form>

				<div class="center-button mt-8">
					<a href="/urls" class="text-[var(--accent)] hover:underline">
						View saved URLs →
					</a>
				</div>
			</section>
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
	@keyframes progress-indeterminate {
		0% {
			margin-left: -100%;
			width: 100%;
		}
		100% {
			margin-left: 100%;
			width: 100%;
		}
	}

	.editor-wrapper {
		background: var(--bg);
		border-radius: var(--radius-lg);
		padding: 1.5rem;
	}

	.editor-header-bar {
		border-bottom: 1px solid var(--border);
		padding-bottom: 1rem;
	}

	.center-button {
		display: flex;
		justify-content: center;
	}
</style>
