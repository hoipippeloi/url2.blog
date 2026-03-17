<script lang="ts">
	interface Props {
		urlValue: string;
		onUrlChange: (url: string) => void;
		onPaste: () => Promise<void>;
		onSubmit: (formData: FormData) => Promise<void>;
		disabled?: boolean;
	}

	let { urlValue, onUrlChange, onPaste, onSubmit, disabled = false }: Props = $props();

	let isSubmitting = $state(false);

	async function handleSubmit(e: Event) {
		const form = e.target as HTMLFormElement;
		e.preventDefault();

		if (!urlValue) return;

		isSubmitting = true;
		const formData = new FormData(form);
		formData.set('url', urlValue);

		try {
			await onSubmit(formData);
		} finally {
			isSubmitting = false;
		}
	}
</script>

<form method="POST" action="?/saveUrl" class="space-y-4" onsubmit={handleSubmit}>
	<div class="input-group">
		<label class="input-label" for="url-input">
			Paste your URL
		</label>
		<div class="relative">
			<input
				id="url-input"
				type="url"
				name="url"
				class="input-field pr-12"
				placeholder="https://example.com"
				autocomplete="off"
				required
				bind:value={urlValue}
				disabled={disabled || isSubmitting}
			/>
			<button
				type="button"
				class="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-[var(--accent-light)] transition-colors cursor-pointer"
				onclick={onPaste}
				disabled={disabled || isSubmitting}
				title="Paste from clipboard"
				aria-label="Paste from clipboard"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="18"
					height="18"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
					<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
				</svg>
			</button>
		</div>
	</div>

	<button type="submit" class="btn btn-primary mt-2" disabled={disabled || isSubmitting || !urlValue}>
		{#if isSubmitting}
			Saving...
		{:else}
			Save
		{/if}
	</button>
</form>
