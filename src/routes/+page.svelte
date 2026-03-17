<script lang="ts">
	import '../app.css';
	import Modal from '$lib/components/Modal.svelte';
	import BlogEditor from '$lib/components/BlogEditor.svelte';
	import Header from '$lib/components/Header.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import UrlInputForm from '$lib/components/UrlInputForm.svelte';
	import ClipboardModal from '$lib/components/ClipboardModal.svelte';
	import GeneratingModal from '$lib/components/GeneratingModal.svelte';
	import { Files } from '@lucide/svelte';

	// Modal state
	let modalOpen = $state(false);
	let currentUrlId = $state<string | null>(null);
	let currentUrl = $state<string>('');
	let isGenerating = $state(false);
	let urlInputValue = $state<string>('');

	// Clipboard modal state
	let clipboardModalOpen = $state(false);
	let clipboardModalMessage = $state<string>('');

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

	// Auto-paste from clipboard on page load if URL starts with http
	$effect(() => {
		async function checkClipboard() {
			try {
				const clipboardText = await navigator.clipboard.readText();
				if (clipboardText && clipboardText.startsWith('http')) {
					urlInputValue = clipboardText.trim();
				}
			} catch (err) {
				// Clipboard access denied or not available - silently fail
				console.log('Clipboard access not available:', err);
			}
		}
		checkClipboard();
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

	async function handlePasteFromClipboard() {
		try {
			const clipboardText = await navigator.clipboard.readText();
			if (clipboardText && clipboardText.startsWith('http')) {
				urlInputValue = clipboardText.trim();
			} else if (clipboardText && !clipboardText.startsWith('http')) {
				clipboardModalMessage = 'Clipboard does not contain a valid URL (must start with http)';
				clipboardModalOpen = true;
			} else {
				clipboardModalMessage = 'Clipboard is empty. Please copy a URL first.';
				clipboardModalOpen = true;
			}
		} catch (err) {
			clipboardModalMessage = 'Failed to access clipboard. Please paste manually.';
			clipboardModalOpen = true;
		}
	}

	function closeClipboardModal() {
		clipboardModalOpen = false;
		clipboardModalMessage = '';
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
			<Alert type="error" message={errorMessage} title="Error" onDismiss={() => errorMessage = null} />
		{/if}

		{#if successMessage}
			<Alert type="success" message={successMessage} />
		{/if}

		<GeneratingModal open={isGenerating} />

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
				<UrlInputForm
					urlValue={urlInputValue}
					onUrlChange={(url) => urlInputValue = url}
					onPaste={handlePasteFromClipboard}
					onSubmit={handleSaveUrl}
				/>

				<ClipboardModal
					open={clipboardModalOpen}
					message={clipboardModalMessage}
					onclose={closeClipboardModal}
				/>

				<div class="flex justify-center mt-4">
					<a href="/urls" class="text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors">
						<Files size={24} />
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
