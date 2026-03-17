<script lang="ts">
	let { open = $bindable(false) } = $props();
</script>

{#if open}
	<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
		<div class="bg-white rounded-xl shadow-2xl p-8 max-w-sm mx-4">
			<h3 class="text-xl font-semibold text-zinc-900 mb-4">Generating your blog post...</h3>
			<div class="w-full bg-zinc-100 rounded-full h-2 overflow-hidden">
				<div class="h-full bg-zinc-900 animate-pulse" style="width: 100%;"></div>
			</div>
			<p class="text-sm text-zinc-500 mt-4">
				This may take up to 30 seconds
			</p>
		</div>
	</div>
{/if}
