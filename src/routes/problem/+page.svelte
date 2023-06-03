<script lang="ts">
	import { page } from "$app/stores";
	import { t } from "svelte-i18n";
	import type { PageData } from "./$types";

	export let data: PageData;
	console.log(data);
</script>

<svelte:head>
	<title>{$t("nav.problem")} | WASM OJ Wonderland</title>
	<meta name="description" content={$t("with-tech")} />
	<meta property="og:image" content="{$page.url.origin}/images/preview-0.jpg" />
</svelte:head>

<div class="overflow-x-auto px-4 py-24">
	<table class="table w-full">
		<thead>
			<tr>
				<th>{$t("problem.id")}</th>
				<th>{$t("problem.problem")}</th>
				<th>{$t("problem.tags")}</th>
			</tr>
		</thead>
		<tbody>
			{#each data.problems as problem}
				<a class="contents" href="/problem/{problem.id}">
					<tr class="hover">
						<td class="transition-all">{problem.id}</td>
						<th class="transition-all">{problem.name}</th>
						<td class="transition-all">
							{#each problem.tags as tag}
								<div class="badge mx-1">{tag}</div>
							{/each}
						</td>
					</tr>
				</a>
			{/each}
		</tbody>
	</table>
</div>
