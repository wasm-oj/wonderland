<script lang="ts">
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
	import Head from "$lib/component/Head.svelte";
	import { onMount } from "svelte";
	import { t } from "svelte-i18n";

	const token = $page.url.searchParams.get("token")?.trim();

	onMount(async () => {
		if (!token) {
			await goto("/");
		}
	});

	let copied = false;
	async function copy() {
		if (!token || copied) {
			return;
		}

		await navigator.clipboard.writeText(token);

		copied = true;
		setTimeout(() => (copied = false), 2000);
	}
</script>

<Head title={$t("auth.device-token")} />

<div class="flex h-full w-full items-center justify-center p-4">
	<div class="prose w-full">
		<h1 class="text-2xl">{$t("auth.device-token")}</h1>
		<p class="opacity-70">
			{$t("auth.device-token-description")}
		</p>
		<div class="join w-full">
			<input class="input join-item flex-1" type="text" value={token} readonly />
			<button
				class="join-item btn"
				class:btn-neutral={!copied}
				class:btn-success={copied}
				on:click={copy}
			>
				{copied ? $t("auth.copied") : $t("auth.copy")}
			</button>
		</div>
	</div>
</div>
