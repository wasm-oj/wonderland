<script lang="ts">
	import Head from "$lib/component/Head.svelte";
	import { t } from "svelte-i18n";
	import type { PageData } from "./$types";
	import Status from "./Status.svelte";

	export let data: PageData;
	console.log(data);
</script>

<Head title={$t("nav.submission")} />

<div class="overflow-x-auto px-4 py-24">
	<table class="table w-full bg-base-100">
		<thead>
			<tr>
				<th class="!relative">{$t("submission.id")}</th>
				<th>{$t("submission.problem")}</th>
				<th>{$t("submission.status")}</th>
				<th>{$t("submission.score")}</th>
				<th>{$t("submission.cost")}</th>
				<th>{$t("submission.memory")}</th>
				<th>{$t("submission.lang")}</th>
				<th>{$t("submission.time")}</th>
			</tr>
		</thead>
		<tbody>
			{#each data.submissions as submission}
				<tr class="hover top-0 transition-all hover:-top-0.5 hover:shadow-md">
					<td class="transition-all">
						<a class="link-hover" href="/submission/{submission.id}">
							{submission.id}
						</a>
					</td>
					<th class="transition-all">
						<a href="/problem/{submission.problem_id}" class="link-hover">
							{submission.problem_id}
						</a>
					</th>
					<td class="transition-all">
						<Status status={submission.status} />
					</td>
					<td class="transition-all">
						{submission.score}
					</td>
					<td class="transition-all">
						${submission.cost}
					</td>
					<td class="transition-all">
						{submission.memory}MB
					</td>
					<td class="transition-all">
						{submission.code_lang}
					</td>
					<td class="transition-all">
						{new Date(parseInt(submission.id.substring(0, 8), 36)).toLocaleString()}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
