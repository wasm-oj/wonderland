<script lang="ts">
	import { invalidateAll } from "$app/navigation";
	import { page } from "$app/stores";
	import Code from "$lib/md/Code.svelte";
	import { onMount } from "svelte";
	import { t } from "svelte-i18n";
	import Status from "../Status.svelte";
	import type { PageData } from "./$types";

	export let data: PageData;
	$: details = data.submission.details
		? (JSON.parse(data.submission.details) as {
				status: string;
				cost: number;
				memory: number;
		  }[][])
		: null;

	let reload_factor = 1;
	onMount(() => {
		prepare_reload();
	});

	async function prepare_reload() {
		setTimeout(() => {
			if (data.submission.status === "running") {
				invalidateAll().then(() => {
					prepare_reload();
				});
			}
		}, 2500 * reload_factor);
		reload_factor *= 2;
	}

	const total_score =
		data.problem.testcase.reduce((acc, cur) => acc + cur.score, 0) *
		data.problem.policy.reduce((acc, cur) => acc + cur.score, 0);
</script>

<svelte:head>
	<title>{$t("nav.submission")} {data.submission.id} | WASM OJ Wonderland</title>
	<meta name="description" content={$t("with-tech")} />
	<meta property="og:image" content="{$page.url.origin}/images/preview-0.jpg" />
</svelte:head>

<div class="h-full w-full overflow-auto">
	<div class="flex w-full items-center justify-center gap-4 px-4 max-lg:flex-col lg:items-start">
		{#key data.submission.status}
			<div class="prose w-full py-20 lg:max-h-screen lg:overflow-auto">
				<h1>{data.submission.id}</h1>
				<p>
					<a class="link-hover" href="/problem/{data.submission.problem_id}">
						{data.problem.name}
					</a>
				</p>
				<p>
					{$t("submission.submitted-at", {
						values: {
							time: new Date(
								parseInt(data.submission.id.substring(0, 8), 36),
							).toLocaleString(),
						},
					})}
				</p>
				<p>
					{$t("submission.submitted-by", {
						values: {
							submitter: data.submission.submitter_id,
						},
					})}
				</p>

				<h2>
					<Status status={data.submission.status} />
				</h2>
				<p>
					{$t("submission.score")}: {data.submission.score} / {total_score}
				</p>
				<p>{$t("submission.cost")}: ${data.submission.cost}</p>
				<p>{$t("submission.memory")}: {data.submission.memory} MB</p>

				{#if details}
					<h2>{$t("submission.details")}</h2>
					<table class="table w-full">
						<thead>
							<tr>
								<th>{$t("submission.testcase")}</th>
								<th>{$t("submission.stats")}</th>
								{#each data.problem.policy as policy, i}
									<th>
										<p
											class="tooltip"
											data-tip="${policy.budget}, {policy.memory}MB, {policy.score} pts"
										>
											{$t("submission.policy")} #{i}
										</p>
									</th>
								{/each}
							</tr>
						</thead>
						<tbody>
							{#each data.problem.testcase as testcase, i}
								<tr class="hover">
									<th class="transition-all">
										<p
											class="tooltip tooltip-right"
											data-tip="{testcase.score} pts | {testcase.description ||
												$t('problem.no-description')}"
										>
											#{i}
										</p>
									</th>
									<td class="transition-all">
										{$t("submission.cost")}: ${details[i][0].cost}<br />
										{$t("submission.memory")}: {details[i][0].memory} MB
									</td>
									{#each data.problem.policy as policy, j}
										<td class="transition-all">
											<Status status={details[i][j].status} />
										</td>
									{/each}
								</tr>
							{/each}
						</tbody>
					</table>
				{/if}
			</div>
		{/key}

		{#if data.submission.code}
			<div class="divider max-h-screen pb-4 pt-20 lg:divider-horizontal" />

			<div class="w-full max-w-2xl pb-20 lg:py-20">
				<Code text={data.submission.code} lang={data.submission.code_lang} />
			</div>
		{/if}
	</div>
</div>
