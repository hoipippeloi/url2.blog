<script lang="ts">
	import Modal from '$lib/components/Modal.svelte';
	import BlogEditor from '$lib/components/BlogEditor.svelte';
	import Header from '$lib/components/Header.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import UrlCard from '$lib/components/UrlCard.svelte';
	import GeneratingModal from '$lib/components/GeneratingModal.svelte';
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
	let isDeleting = $state<string | null>(null);

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

	async function handleDeleteUrl(savedUrlId: string) {
		if (!confirm('Are you sure you want to delete this URL? This will also delete any associated blog posts.')) {
			return;
		}

		isDeleting = savedUrlId;

		try {
			const formData = new FormData();
			formData.append('savedUrlId', savedUrlId);

			const response = await fetch('?/deleteUrl', {
				method: 'POST',
				body: formData,
			});

			const result = await response.json();

			if (result.type === 'success') {
				successMessage = 'URL deleted successfully';
				// Reload the page to reflect the deletion
				window.location.reload();
			} else if (result.status >= 400) {
				const data = parseFormDataResponse<{ error?: string }>(result);
				errorMessage = data?.error || 'Failed to delete URL';
			}
		} catch (err) {
			errorMessage = 'Failed to delete URL. Please try again.';
		} finally {
			isDeleting = null;
		}
	}
</script>

<svelte:head>
	<title>Saved URLs - URL2.blog</title>
</svelte:head>

<Header />

{#if errorMessage}
	<Alert type="error" message={errorMessage} dismissible onDismiss={() => errorMessage = null} />
{/if}

{#if successMessage}
	<Alert type="success" message={successMessage} dismissible onDismiss={() => successMessage = null} />
{/if}

<GeneratingModal open={isGenerating} />

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
							<UrlCard
								savedUrl={savedUrl}
								onEdit={(blogPostId, title, content, url) => openEditor(blogPostId, title, content, url)}
								onRegenerate={(urlId, url) => openGenerateModal(urlId, url)}
								onDelete={handleDeleteUrl}
								isDeleting={isDeleting === savedUrl.id}
							/>
						{/each}
					</div>
				{:else}
									<EmptyState
										message="No saved URLs yet"
										actionText="Save your first URL"
										actionHref="/"
									/>
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
