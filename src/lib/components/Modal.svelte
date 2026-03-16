<script lang="ts">
	import { X, Loader2 } from '@lucide/svelte';

	interface Props {
		open?: boolean;
		savedUrlId?: string | null;
		onsubmit?: (formData: FormData) => void | Promise<void>;
		onclose?: () => void;
	}

	let {
		open = false,
		savedUrlId = null,
		onsubmit,
		onclose,
	}: Props = $props();

	let formTitle = $state('');
	let formBlogReason = $state('');
	let formTone = $state('Professional');
	let formFormat = $state('Tutorial');
	let formTags = $state('');
	let formCategory = $state('Technology');
	let formAdditionalInstructions = $state('');
	let isSubmitting = $state(false);

	$effect(() => {
		if (open) {
			formTitle = '';
			formBlogReason = '';
			formTone = 'Professional';
			formFormat = 'Tutorial';
			formTags = '';
			formCategory = 'Technology';
			formAdditionalInstructions = '';
			isSubmitting = false;
		}
	});

	let canGenerate = $derived(formTitle.length > 0 && formBlogReason.length > 0);

	function handleClose() {
		onclose?.();
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (!canGenerate || isSubmitting) return;

		const formData = new FormData(e.target as HTMLFormElement);
		isSubmitting = true;

		try {
			await onsubmit?.(formData);
		} finally {
			isSubmitting = false;
		}
	}

	function handleTagsInput(e: Event & { currentTarget: HTMLInputElement }) {
		formTags = e.currentTarget.value;
	}
</script>

{#if open}
	<div class="modal-overlay open" role="dialog" aria-modal="true">
		<div class="modal">
			<div class="modal-header">
				<h2 class="modal-title">Generate Blog Post</h2>
				<button
					class="modal-close"
					aria-label="Close modal"
					onclick={handleClose}
					disabled={isSubmitting}
				>
					<X size={16} />
				</button>
			</div>

			<form onsubmit={handleSubmit}>
				<input type="hidden" name="savedUrlId" value={savedUrlId ?? ''} />
				<input type="hidden" name="title" value={formTitle} />
				<input type="hidden" name="blogReason" value={formBlogReason} />
				<input type="hidden" name="tone" value={formTone} />
				<input type="hidden" name="format" value={formFormat} />
				<input type="hidden" name="tags" value={formTags} />
				<input type="hidden" name="category" value={formCategory} />
				<input type="hidden" name="additionalInstructions" value={formAdditionalInstructions} />

				<div class="modal-body space-y-4">
					<div class="input-group">
						<label class="input-label" for="modal-title">
							Title
						</label>
						<input
							id="modal-title"
							type="text"
							class="input-field"
							aria-label="Title"
							bind:value={formTitle}
							placeholder="Blog post title"
							required
							disabled={isSubmitting}
						/>
					</div>

					<div class="input-group">
						<label class="input-label" for="modal-blogReason">
							Blog Reason
						</label>
						<textarea
							id="modal-blogReason"
							class="input-field textarea-field"
							bind:value={formBlogReason}
							placeholder="Why are you writing about this?"
							required
							disabled={isSubmitting}
						></textarea>
					</div>

					<div class="input-group">
						<label class="input-label" for="modal-tone">
							Tone
						</label>
						<select id="modal-tone" class="input-field" bind:value={formTone} disabled={isSubmitting}>
							<option value="Professional">Professional</option>
							<option value="Casual">Casual</option>
							<option value="Technical">Technical</option>
							<option value="Friendly">Friendly</option>
							<option value="Academic">Academic</option>
						</select>
					</div>

					<div class="input-group">
						<label class="input-label" for="modal-format">
							Format
						</label>
						<select id="modal-format" class="input-field" bind:value={formFormat} disabled={isSubmitting}>
							<option value="Tutorial">Tutorial</option>
							<option value="Guide">Guide</option>
							<option value="Review">Review</option>
							<option value="News">News</option>
							<option value="Opinion">Opinion</option>
						</select>
					</div>

					<div class="input-group">
						<label class="input-label" for="modal-category">
							Category
						</label>
						<select id="modal-category" class="input-field" bind:value={formCategory} disabled={isSubmitting}>
							<option value="Technology">Technology</option>
							<option value="Product">Product</option>
							<option value="Tutorial">Tutorial</option>
							<option value="News">News</option>
						</select>
					</div>

					<div class="input-group">
						<label class="input-label" for="modal-tags">
							Tags (comma-separated)
						</label>
						<input
							id="modal-tags"
							type="text"
							class="input-field"
							placeholder="javascript, web, tutorial"
							bind:value={formTags}
							disabled={isSubmitting}
						/>
					</div>

					<div class="input-group">
						<label class="input-label" for="modal-additionalInstructions">
							Additional Instructions
						</label>
						<textarea
							id="modal-additionalInstructions"
							class="input-field textarea-field"
							bind:value={formAdditionalInstructions}
							placeholder="Any specific requirements or focus areas"
							disabled={isSubmitting}
						></textarea>
					</div>
				</div>

				<div class="modal-footer">
					<button type="button" class="btn btn-outline" onclick={handleClose} disabled={isSubmitting}>
						Cancel
					</button>
					<button
						type="submit"
						class="btn btn-primary"
						disabled={!canGenerate || isSubmitting}
					>
						{#if isSubmitting}
							<Loader2 size={16} class="spinner-icon" />
							Generating...
						{:else}
							Generate
						{/if}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}