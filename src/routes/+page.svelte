<script lang="ts">
	import '../app.css';
	import Modal from '$lib/components/Modal.svelte';
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';

	export let data: PageData;

	let modalOpen = false;
	let currentUrlId: string | null = null;
	let editorContent = '';
	let isGenerating = false;
	let generationError: string | null = null;
	let currentBlogPostId: string | null = null;

	function handleUrlSubmit() {
		currentUrlId = null;
		modalOpen = true;
	}

	function handleGenerate(event: CustomEvent<{
		title: string;
		blogReason: string;
		tone: string;
		format: string;
		tags: string[];
		category: string;
		additionalInstructions: string;
	}>) {
		currentUrlId = event.detail;
		isGenerating = true;
		generationError = null;
	}

	function handleCloseModal() {
		modalOpen = false;
		currentUrlId = null;
	}

	function handleRegenerate(urlId: string) {
		currentUrlId = urlId;
		modalOpen = true;
	}

	function handleEditorChange(content: string, blogPostId: string) {
		editorContent = content;
		currentBlogPostId = blogPostId;
	}
</script>

<main class="min-h-screen flex flex-col items-center justify-center p-4">
	<div class="w-full max-w-2xl space-y-8">
		<header class="text-center space-y-4">
			<h1 class="text-5xl font-display font-extrabold bg-gradient(135deg, var(--fg) 0%, var(--accent) 100%) bg-clip-text text-transparent">
				URL2.blog
			</h1>
			<p class="text-lg text-[var(--fg-muted)]">
				Transform your URLs into blog posts
			</p>
		</header>

		{#if generationError}
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
					<p class="alert-title">Generation Error</p>
					<p class="alert-message">{generationError}</p>
				</div>
				<button class="btn btn-outline btn-sm" onclick={() => generationError = null}>
					Dismiss
				</button>
			</div>
		{/if}

		<section class="card card-hover">
			<div class="card-body space-y-6">
				<form method="POST" action="?/saveUrl" use:enhance>
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
						<div class="input-hint">
							Paste any URL you want to write about
						</div>
					</div>

					<button type="submit" class="btn btn-primary w-full">
						Save
					</button>
				</form>
			</div>
		</section>

		{#if data.savedUrls.length > 0}
			<section class="space-y-4">
				<h2 class="text-2xl font-display font-bold">
					Saved URLs
				</h2>
				<div class="space-y-3">
					{#each data.savedUrls as savedUrl}
						<div class="card">
							<div class="card-body">
								<div class="flex items-center justify-between">
									<div class="space-y-1">
										<h3 class="card-title">{savedUrl.url}</h3>
										<p class="card-text">
											{#if savedUrl.hasBlogPost}
												<span class="badge badge-success">Generated</span>
											{:else}
												<span class="badge badge-outline">Pending</span>
											{/if}
										</p>
									</div>
									<button
										class="btn btn-outline btn-sm"
										onclick={() => handleRegenerate(savedUrl.id)}
									>
										Regenerate
									</button>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</section>
		{/if}
	</div>

	<Modal
		open={modalOpen}
		ongenerate={handleGenerate}
		onclose={handleCloseModal}
	/>

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
</style>
