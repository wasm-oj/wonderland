<script lang="ts">
	import { page } from "$app/stores";
	import Head from "$lib/component/Head.svelte";
	import { onMount } from "svelte";
	import { t } from "svelte-i18n";
	import { fade } from "svelte/transition";
	import Icon from "@iconify/svelte";
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

		<div class="stats w-full bg-opacity-50 shadow transition-all hover:shadow-md">
			<div class="group stat">
				<div
					class="stat-figure top-0 transition-all group-hover:top-1 group-hover:drop-shadow-md"
				>
					<Icon icon="octicon:person-16" class="inline-block h-8 w-8 text-primary" />
				</div>
				<div
					class="stat-value top-0 transition-all delay-75 group-hover:-top-1 group-hover:scale-110 group-hover:drop-shadow-md"
				>
					{data.stat.user}
				</div>
			</div>

			<a class="contents" href="/problem">
				<div class="group stat">
					<div
						class="stat-figure top-0 transition-all group-hover:top-1 group-hover:drop-shadow-md"
					>
						<Icon icon="octicon:apps-16" class="inline-block h-8 w-8 text-primary" />
					</div>
					<div
						class="stat-value top-0 transition-all delay-75 group-hover:-top-1 group-hover:scale-110 group-hover:drop-shadow-md"
					>
						{data.stat.problem}
					</div>
				</div>
			</a>

			<a class="contents" href="/submission">
				<div class="group stat">
					<div
						class="stat-figure top-0 transition-all group-hover:top-1 group-hover:drop-shadow-md"
					>
						<Icon
							icon="octicon:git-commit-16"
							class="inline-block h-6 w-6 text-primary"
						/>
					</div>
					<div
						class="stat-value top-0 transition-all delay-75 group-hover:-top-1 group-hover:scale-110 group-hover:drop-shadow-md"
					>
						{data.stat.submission}
					</div>
				</div>
			</a>
		</div>

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
