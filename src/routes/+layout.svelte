<script lang="ts">
	import '../app.css';
	import type { LayoutData } from './+layout';

	export let data: LayoutData;
</script>

<svelte:head>
	<title>{data.title}</title>
	<meta name="description" content={data.description} />
	<link
		href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200..800&family=Lekton:ital,wght@0,400;0,700;1,400&family=JetBrains+Mono:wght@400;500&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<slot />
