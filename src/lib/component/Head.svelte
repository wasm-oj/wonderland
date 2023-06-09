<script lang="ts">
	import { page } from "$app/stores";

	export let title = "";
	export let description = "The modern modular online judge, born for WebAssembly.";
	export let image = `${$page.url.origin}/images/preview-0.jpg`;

	function ellipsis(str: string, len: number) {
		if (str.length <= len) {
			return str;
		}

		const words = str.split(" ");
		let result = "";
		for (const word of words) {
			if (result.length + word.length > len) {
				break;
			}
			result += word + " ";
		}
		return result + "...";
	}
</script>

<svelte:head>
	{#if title}
		<title>{title} | WASM OJ Wonderland</title>
	{:else}
		<title>WASM OJ Wonderland</title>
	{/if}
	<meta name="description" content={ellipsis(description.replace(/\n/g, " "), 240)} />
	<meta property="og:image" content={image} />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>
