<script lang="ts">
	let {
		open = $bindable(false),
		message = '',
		onclose,
	}: {
		open?: boolean;
		message?: string;
		onclose?: () => void;
	} = $props();

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			onclose?.();
		}
	}
</script>

{#if open}
	<div
		class="modal-overlay open modal-overlay-top"
		onclick={onclose}
		onkeydown={handleKeydown}
		role="dialog"
		aria-modal="true"
		aria-labelledby="clipboard-modal-title"
		tabindex="-1"
	>
		<div
			class="small-modal"
			onclick={(e) => e.stopPropagation()}
			role="alertdialog"
			aria-modal="true"
			tabindex="0"
		>
			<div class="small-modal-body">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="small-modal-icon"
					aria-hidden="true"
				>
					<circle cx="12" cy="12" r="10" />
					<line x1="12" y1="8" x2="12" y2="12" />
					<line x1="12" y1="16" x2="12.01" y2="16" />
				</svg>
				<p
					id="clipboard-modal-title"
					class="small-modal-message"
				>
					{message}
				</p>
			</div>
			<button
				class="btn btn-sm btn-outline"
				onclick={onclose}
				type="button"
				autofocus
			>
				OK
			</button>
		</div>
	</div>
{/if}

<style>
	.modal-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 1rem;
		opacity: 0;
		visibility: hidden;
		transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.modal-overlay.open {
		opacity: 1;
		visibility: visible;
	}

	.modal-overlay-top {
		align-items: flex-start;
		padding-top: 15vh;
	}

	.small-modal {
		background: var(--bg-elevated, #ffffff);
		border: 1px solid var(--border, #e5e5e5);
		border-radius: 16px;
		max-width: 320px;
		width: 100%;
		padding: 1.5rem;
		transform: scale(0.95) translateY(20px);
		transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
		text-align: center;
	}

	.modal-overlay.open .small-modal {
		transform: scale(1) translateY(0);
	}

	.small-modal-body {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.small-modal-icon {
		color: var(--error, #dc2626);
	}

	.small-modal-message {
		font-size: 0.9375rem;
		color: var(--fg, #000000);
		line-height: 1.5;
		margin: 0;
	}
</style>
