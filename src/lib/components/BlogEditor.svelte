<script lang="ts">
	interface Props {
		content?: string;
		title?: string;
		savedUrlId?: string | null;
		onSave?: (data: { content: string; title: string }) => void;
		onCancel?: () => void;
	}

	let {
		content = '',
		title = '',
		savedUrlId = null,
		onSave,
		onCancel,
	}: Props = $props();

	let formContent = $state('');
	let formTitle = $state('');
	let isEditing = $state(true);

	$effect(() => {
		formContent = content;
		formTitle = title;
	});

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
				placeholder="Enter your blog post title..."
			/>
		</div>

		<div class="editor-toolbar">
			<button
				class="btn btn-outline btn-sm"
				class:active={isEditing}
				onclick={() => isEditing = true}
			>
				Edit
			</button>
			<button
				class="btn btn-outline btn-sm"
				class:active={!isEditing}
				onclick={() => isEditing = false}
			>
				Preview
			</button>
		</div>
	</div>

	<div class="editor-stats">
		<span>{wordCount} words</span>
		<span>•</span>
		<span>{charCount} characters</span>
	</div>

	<div class="editor-body">
		{#if isEditing}
			<textarea
				class="input-field textarea-field editor-textarea"
				bind:value={formContent}
				placeholder="Start writing your blog post in Markdown..."
			></textarea>
		{:else}
			<div class="preview-content">
				{#if formContent}
					{@html formContent.split('\n').map(line => {
						if (line.startsWith('# ')) {
							return `<h1>${line.slice(2)}</h1>`;
						} else if (line.startsWith('## ')) {
							return `<h2>${line.slice(3)}</h2>`;
						} else if (line.startsWith('### ')) {
							return `<h3>${line.slice(4)}</h3>`;
						} else if (line.startsWith('- ')) {
							return `<li>${line.slice(2)}</li>`;
						} else if (line.trim() === '') {
							return '<br>';
						} else {
							return `<p>${line}</p>`;
						}
					}).join('')}
				{:else}
					<p class="text-[var(--fg-muted)]">No content to preview</p>
				{/if}
			</div>
		{/if}
	</div>

	<div class="editor-footer">
		<button class="btn btn-outline" onclick={handleCancel}>
			Cancel
		</button>
		<button
			class="btn btn-primary"
			disabled={!formTitle.trim() || !formContent.trim()}
			onclick={handleSave}
		>
			Save Changes
		</button>
	</div>
</div>

<style>
	.editor-container {
		display: flex;
		flex-direction: column;
		height: 100%;
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

	.editor-toolbar {
		display: flex;
		gap: 0.5rem;
	}

	.editor-toolbar .btn.active {
		background: var(--accent);
		color: var(--bg);
		border-color: var(--accent);
	}

	.editor-stats {
		display: flex;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		font-size: 0.75rem;
		color: var(--fg-muted);
		border-bottom: 1px solid var(--border);
	}

	.editor-body {
		flex: 1;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	.editor-textarea {
		flex: 1;
		min-height: 300px;
		resize: none;
		font-family: var(--font-mono, 'Fira Code', monospace);
		font-size: 0.875rem;
		line-height: 1.6;
		padding: 1rem;
		border: none;
		border-radius: 0;
	}

	.editor-textarea:focus {
		outline: none;
		box-shadow: none;
	}

	.preview-content {
		flex: 1;
		padding: 1rem;
		overflow-y: auto;
	}

	.preview-content :global(h1) {
		font-size: 1.5rem;
		font-weight: 700;
		margin: 1rem 0 0.5rem;
	}

	.preview-content :global(h2) {
		font-size: 1.25rem;
		font-weight: 600;
		margin: 0.75rem 0 0.5rem;
	}

	.preview-content :global(h3) {
		font-size: 1rem;
		font-weight: 600;
		margin: 0.5rem 0 0.25rem;
	}

	.preview-content :global(p) {
		margin: 0.5rem 0;
	}

	.preview-content :global(li) {
		margin-left: 1.5rem;
	}

	.editor-footer {
		display: flex;
		justify-content: flex-end;
		gap: 0.75rem;
		padding: 1rem;
		border-top: 1px solid var(--border);
	}
</style>