<script lang="ts">
	import { goto, invalidateAll } from "$app/navigation";
	import { onMount } from "svelte";
	import { t } from "svelte-i18n";
	import type { PageData } from "./$types";

	export let data: PageData;

	onMount(async () => {
		if (data.ok) {
			await invalidateAll();
			await goto("/problem");
		}
	});
</script>

<svelte:head>
	<title>WASM OJ Wonderland</title>
	<meta property="og:image" content="/images/preview-0.jpg" />
</svelte:head>

<div class="flex h-full w-full items-center justify-center">
	{#if data.ok}
		<h1 class="animate-pulse text-2xl">{$t("signing-in")}</h1>
	{:else}
		<h1 class="text-error">{$t("auth.invalid-token")}</h1>
	{/if}
</div>
