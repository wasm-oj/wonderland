<script lang="ts">
	import { page } from "$app/stores";
	import Head from "$lib/component/Head.svelte";
	import { onMount } from "svelte";
	import { t } from "svelte-i18n";
	import { fade } from "svelte/transition";
	import type { PageData } from "./$types";

	export let data: PageData;

	let night = !!Math.floor(Math.random() * 2);
	onMount(() => {
		night = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
		window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (event) => {
			night = event.matches;
		});
	});
</script>

<Head title={$t("welcome")} image="{$page.url.origin}/images/preview-{night ? 1 : 0}.jpg" />

<div class="flex h-full w-full items-center justify-center">
	{#key night}
		<img
			transition:fade={{ duration: 200 }}
			class="pointer-events-none absolute left-0 top-0 h-full w-full object-cover opacity-40"
			src="/images/landscape-{night ? 1 : 0}.jpg"
			alt=""
		/>
	{/key}
	<div class="prose">
		<h1>{$t("welcome")}</h1>
		<p>{$t("with-tech")}</p>

		<div class="divider" />

		<p>
			{$t("compilers-and-runners", {
				values: {
					compilers: data.cfg.compilers,
					runners: data.cfg.runners,
				},
			})}
		</p>
	</div>
</div>
