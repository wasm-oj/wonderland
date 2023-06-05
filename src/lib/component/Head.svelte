<script lang="ts">
	import { page } from "$app/stores";

	export let title = "";
	export let description = "The modern modular online judge, born for WebAssembly.";
	export let image = `${$page.url.origin}/images/preview-0.jpg`;
</script>

<svelte:head>
	{#if title}
		<title>{title} | WASM OJ Wonderland</title>
	{:else}
		<title>WASM OJ Wonderland</title>
	{/if}
	<meta name="description" content={description.replace(/\n/g, " ")} />
	<meta property="og:image" content={image} />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>
