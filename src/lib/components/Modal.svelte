<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let open = false;
	export let title = '';
	export let blogReason = '';
	export let tone = 'Professional';
	export let format = 'Tutorial';
	export let tags: string[] = [];
	export let category = 'Technology';
	export let additionalInstructions = '';

	const dispatch = createEventDispatcher<{
		generate: {
			title: string;
			blogReason: string;
			tone: string;
			format: string;
			tags: string[];
			category: string;
			additionalInstructions: string;
		};
		close: void;
	}>();

	function handleGenerate() {
		dispatch('generate', {
			title,
			blogReason,
			tone,
			format,
			tags,
			category,
			additionalInstructions,
		});
	}

	function handleClose() {
		dispatch('close');
	}

	$: canGenerate = title.length > 0;
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
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<line x1="18" y1="6" x2="6" y2="18" />
						<line x1="6" y1="6" x2="18" y2="18" />
					</svg>
				</button>
			</div>

			<div class="modal-body space-y-4">
				<div class="input-group">
					<label class="input-label" for="title">
						Title
					</label>
					<input
						id="title"
						type="text"
						class="input-field"
						aria-label="Title"
						bind:value={title}
						placeholder="Blog post title"
					/>
				</div>

				<div class="input-group">
					<label class="input-label" for="blogReason">
						Blog Reason
					</label>
					<textarea
						id="blogReason"
						class="input-field textarea-field"
						bind:value={blogReason}
						placeholder="Why are you writing about this?"
					></textarea>
				</div>

				<div class="input-group">
					<label class="input-label" for="tone">
						Tone
					</label>
					<select id="tone" class="input-field" bind:value={tone}>
						<option value="Professional">Professional</option>
						<option value="Casual">Casual</option>
						<option value="Technical">Technical</option>
						<option value="Friendly">Friendly</option>
						<option value="Academic">Academic</option>
					</select>
				</div>

				<div class="input-group">
					<label class="input-label" for="format">
						Format
					</label>
					<select id="format" class="input-field" bind:value={format}>
						<option value="Tutorial">Tutorial</option>
						<option value="Guide">Guide</option>
						<option value="Review">Review</option>
						<option value="News">News</option>
						<option value="Opinion">Opinion</option>
					</select>
				</div>

				<div class="input-group">
					<label class="input-label" for="category">
						Category
					</label>
					<select id="category" class="input-field" bind:value={category}>
						<option value="Technology">Technology</option>
						<option value="Product">Product</option>
						<option value="Tutorial">Tutorial</option>
						<option value="News">News</option>
					</select>
				</div>

				<div class="input-group">
					<label class="input-label" for="tags">
						Tags (comma-separated)
					</label>
					<input
						id="tags"
						type="text"
						class="input-field"
						placeholder="javascript, web, tutorial"
						oninput={(e) => (tags = e.currentTarget.value.split(',').map((t) => t.trim()))}
					/>
				</div>

				<div class="input-group">
					<label class="input-label" for="additionalInstructions">
						Additional Instructions
					</label>
					<textarea
						id="additionalInstructions"
						class="input-field textarea-field"
						bind:value={additionalInstructions}
						placeholder="Any specific requirements or focus areas"
					></textarea>
				</div>
			</div>

			<div class="modal-footer">
				<button class="btn btn-outline" onclick={handleClose}>
					Cancel
				</button>
				<button
					class="btn btn-primary"
					disabled={!canGenerate}
					onclick={handleGenerate}
				>
					Generate
				</button>
			</div>
		</div>
	</div>
{/if}
