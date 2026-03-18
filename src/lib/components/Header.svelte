<script lang="ts">
	import { SquareLibrary, Album, Dot, BookMarked } from '@lucide/svelte';
</script>

<header class="fixed top-0 left-0 right-0 z-50 border-b border-[var(--border)]" style="background: var(--bg);">
	<div class="max-w-[2560px] mx-auto flex items-center gap-0.5" style="padding: 1rem;">
		<a href="/" class="hover:opacity-80 transition-opacity">
			<SquareLibrary size={24} class="text-[var(--fg)]" />
		</a>
		<Dot size={24} class="text-[var(--fg-muted)]" />
		<a href="/urls" class="hover:opacity-80 transition-opacity">
			<Album size={24} class="text-[var(--fg)]" />
		</a>
		<Dot size={24} class="text-[var(--fg-muted)]" />
		<a href="/blog" class="hover:opacity-80 transition-opacity">
			<BookMarked size={24} class="text-[var(--fg)]" />
		</a>
	</div>
</header>
