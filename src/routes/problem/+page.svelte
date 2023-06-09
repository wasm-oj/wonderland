<script lang="ts">
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
	import Head from "$lib/component/Head.svelte";
	import { t } from "svelte-i18n";
	import type { PageData } from "./$types";

	export let data: PageData;
	const all_tags = new Set<string>();
	let tags = $page.url.searchParams
		.get("tags")
		?.split(",")
		?.filter((t) => !!t.trim());
	let search = $page.url.searchParams.get("search")?.toLowerCase();
	$: problems = data.problems
		.filter((problem) => {
			let pass = true;

			if (tags && tags.length > 0) {
				pass &&= tags.some((tag) => problem.tags.includes(tag));
			}

			if (search) {
				pass &&=
					problem.name.toLowerCase().includes(search) ||
					problem.id.toLowerCase().includes(search);
			}

			problem.tags.forEach((tag) => all_tags.add(tag));

			return pass;
		})
		.sort((a, b) => a.id.localeCompare(b.id));
	$: {
		const url = new URL($page.url);
		url.searchParams.set("tags", tags?.join(",") ?? "");
		url.searchParams.set("search", search ?? "");
		if (url.toString() !== $page.url.toString()) {
			goto(url, { keepFocus: true, replaceState: true });
		}
	}

	function toggle_tag(tag: string) {
		if (tags?.includes(tag)) {
			tags = tags.filter((t) => t !== tag);
		} else {
			tags = [...(tags ?? []), tag];
		}
	}
</script>

<Head title={$t("nav.problem")} />

<div class="overflow-x-auto px-4 py-20">
	<div class="mb-8 flex w-full">
		<div class="flex-1">
			{#each [...all_tags] as tag}
				<button
					class="badge top-0 mx-1 transition-all hover:badge-primary hover:-top-0.5 hover:shadow-md"
					class:badge-accent={tags?.includes(tag)}
					on:click={() => toggle_tag(tag)}
				>
					{tag}
				</button>
			{/each}
		</div>
		<div>
			<input
				class="input-bordered input input-sm w-40 max-w-xs transition-all focus:w-full"
				placeholder={$t("problem.search")}
				bind:value={search}
			/>
		</div>
	</div>

	<table class="table w-full bg-base-100">
		<thead>
			<tr>
				<th class="w-1/4 max-w-xs">{$t("problem.id")}</th>
				<th class="w-1/2">{$t("problem.problem")}</th>
				<th class="w-1/4 max-w-xs">{$t("problem.tags")}</th>
			</tr>
		</thead>
		<tbody>
			{#each problems as problem}
				<a class="contents" href="/problem/{problem.id}">
					<tr class="hover top-0 transition-all hover:-top-0.5 hover:shadow-md">
						<td class="transition-all">{problem.id}</td>
						<th class="transition-all">{problem.name}</th>
						<td class="transition-all">
							{#each problem.tags as tag}
								<button
									class="badge top-0 mx-1 transition-all hover:badge-primary hover:-top-0.5 hover:shadow-md"
									class:badge-accent={tags?.includes(tag)}
									on:click={(evt) => {
										evt.preventDefault();
										toggle_tag(tag);
									}}
								>
									{tag}
								</button>
							{/each}
						</td>
					</tr>
				</a>
			{/each}
		</tbody>
	</table>
</div>
