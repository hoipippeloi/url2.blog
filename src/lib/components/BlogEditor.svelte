<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import MarkdownEditor from '$lib/components/MarkdownEditor.svelte';

	interface Props {
		content?: string;
		title?: string;
		savedUrlId?: string | null;
		isGenerating?: boolean;
		onSave?: (data: { content: string; title: string }) => void;
		onCancel?: () => void;
	}

	let {
		content = '',
		title = '',
		savedUrlId = null,
		isGenerating = false,
		onSave,
		onCancel,
	}: Props = $props();

	let formContent = $state('');
	let formTitle = $state('');
	let hasUserEdited = $state(false);
	let contentInitialized = $state(false);
	let titleInitialized = $state(false);

	// Initialize content from props when component mounts or props change
	$effect(() => {
		if (!contentInitialized && content) {
			formContent = content;
			contentInitialized = true;
		}
	});

	// Initialize title from props when component mounts or props change
	$effect(() => {
		if (!titleInitialized && title) {
			formTitle = title;
			titleInitialized = true;
		}
	});

	// Sync content from parent while generating and user hasn't edited
	$effect(() => {
		// Sync content while generating (streaming content)
		if (isGenerating && !hasUserEdited) {
			formContent = content;
		}
	});

	// Mark as user edited when they edit the title
	function handleTitleChange() {
		if (!isGenerating) {
			hasUserEdited = true;
		}
	}

	function handleSave() {
		onSave?.({
			content: formContent,
			title: formTitle,
		});
	}

	function handleCancel() {
		onCancel?.();
	}

	let wordCount = $derived(formContent.trim() ? formContent.trim().split(/\s+/).length : 0);
	let charCount = $derived(formContent.length);
</script>

<div class="editor-container">
	<div class="editor-header">
		<div class="editor-title-input">
			<label class="input-label" for="blog-title">Title</label>
			<input
				id="blog-title"
				type="text"
				class="input-field"
				bind:value={formTitle}
				onchange={handleTitleChange}
				placeholder="Enter your blog post title..."
			/>
		</div>
	</div>

	<div class="editor-stats">
		<span>{wordCount} words</span>
		<span>•</span>
		<span>{charCount} characters</span>
		{#if isGenerating}
			<span>•</span>
			<span class="generating-indicator" style="color: var(--accent);">Generating...</span>
		{/if}
	</div>

	<div class="editor-body">
		<MarkdownEditor bind:value={formContent} placeholder="Start writing your blog post in Markdown..." />
	</div>

	<div class="editor-footer">
		<Button variant="outline" onclick={handleCancel}>
			Cancel
		</Button>
		<Button
			variant="primary"
			disabled={!formTitle.trim() || !formContent.trim() || isGenerating}
			onclick={handleSave}
		>
			{isGenerating ? 'Generating...' : 'Save Changes'}
		</Button>
	</div>
</div>

<style>
	.editor-container {
		display: flex;
		flex-direction: column;
		height: 100%;
		min-height: 500px;
		background: var(--bg);
		border-radius: var(--radius-lg);
		overflow: hidden;
	}

	.editor-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
		padding: 1rem;
		border-bottom: 1px solid var(--border);
	}

	.editor-title-input {
		flex: 1;
	}

	.editor-stats {
		display: flex;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		font-size: 0.75rem;
		color: var(--fg-muted);
		border-bottom: 1px solid var(--border);
	}

	.generating-indicator {
		font-weight: 500;
		animation: pulse 1.5s ease-in-out infinite;
	}

	@keyframes pulse {
		0%, 100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}

	.editor-body {
		flex: 1;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		min-height: 300px;
	}

	.editor-footer {
		display: flex;
		justify-content: flex-end;
		gap: 0.75rem;
		padding: 1rem;
		border-top: 1px solid var(--border);
	}
</style>
