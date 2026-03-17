<script lang="ts">
	import '../app.css';
	import Modal from '$lib/components/Modal.svelte';
	import BlogEditor from '$lib/components/BlogEditor.svelte';
	import Header from '$lib/components/Header.svelte';
	import { ClipboardList } from '@lucide/svelte';

	// Modal state
	let modalOpen = $state(false);
	let currentUrlId = $state<string | null>(null);
	let currentUrl = $state<string>('');
	let isGenerating = $state(false);

	// Editor state
	let showEditor = $state(false);
	let editorContent = $state('');
	let editorTitle = $state('');
	let editorBlogPostId = $state<string | null>(null);
	let editorSavedUrl = $state<string>('');

	// UI state
	let errorMessage = $state<string | null>(null);
	let successMessage = $state<string | null>(null);

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

			if (result.type === 'success' && result.data) {
				if (result.data.exists) {
					errorMessage = 'This URL already exists in your collection';
				} else if (result.data.id && result.data.url) {
					openGenerateModal(result.data.id, result.data.url);
				}
			} else if (result.status >= 400 && result.data?.error) {
				errorMessage = result.data.error;
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

			isGenerating = false;

			if (result.type === 'success' && result.data) {
				openEditor(
					result.data.id,
					result.data.title,
					result.data.content,
					currentUrl
				);
			} else if (result.status >= 400 && result.data?.error) {
				errorMessage = result.data.error;
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

<Header />
<main class="pt-16 min-h-screen flex flex-col items-center p-4">
	<div class="flex flex-col items-center w-full max-w-2xl" style="margin-top: 20vh;">

		{#if errorMessage}
			<div class="alert alert-error" role="alert">
				<svg
					class="alert-icon"
					xmlns="http://www.w3.org/2000/svg"
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<circle cx="12" cy="12" r="10" />
					<line x1="12" y1="8" x2="12" y2="12" />
					<line x1="12" y1="16" x2="12.01" y2="16" />
				</svg>
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
				<svg
					class="alert-icon"
					xmlns="http://www.w3.org/2000/svg"
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<polyline points="20 6 9 17 4 12" />
				</svg>
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
					onSave={async (data) => {
						const formData = new FormData();
						formData.append('blogPostId', editorBlogPostId || '');
						formData.append('title', data.title);
						formData.append('content', data.content);

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
						}
					}}
					onCancel={closeEditor}
				/>
			</div>
		{:else}
			<section class="container text-center">
				<form method="POST" action="?/saveUrl" class="space-y-4" onsubmit={(e) => {
					e.preventDefault();
					const formData = new FormData(e.currentTarget);
					handleSaveUrl(formData);
				}}>
					<div class="input-group">
						<label class="input-label" for="url-input">
							Paste your URL
						</label>
						<input
							id="url-input"
							type="url"
							name="url"
							class="input-field"
							placeholder="https://example.com"
							autocomplete="off"
							required
						/>

					</div>

					<button type="submit" class="btn btn-primary mt-2">
						Save
					</button>
				</form>

				<div class="flex justify-center mt-4">
					<a href="/urls" class="text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors">
						<ClipboardList size={24} />
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
</style>
