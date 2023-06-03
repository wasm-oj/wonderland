<script lang="ts">
	import { page } from "$app/stores";
	import Code from "$lib/md/Code.svelte";
	import Markdown from "$lib/md/Markdown.svelte";
	import { t } from "svelte-i18n";
	import type { PageData } from "./$types";

	export let data: PageData;

	const total_score =
		data.problem.testcase.reduce((acc, cur) => acc + cur.score, 0) *
		data.problem.policy.reduce((acc, cur) => acc + cur.score, 0);
</script>

<svelte:head>
	<title>{data.problem.name} | WASM OJ Wonderland</title>
	<meta
		name="description"
		content={data.problem.description.replace(/\n/g, " ").substring(0, 200)}
	/>
	<meta property="og:image" content="{$page.url.origin}/images/preview-0.jpg" />
</svelte:head>

<div class="h-full w-full overflow-auto px-4 py-24">
	<div class="flex w-full flex-col items-center">
		<div class="prose">
			<div class="absolute right-0 top-0 z-10">
				<a class="btn-outline btn-primary btn" href="{$page.url}/submit">Submit</a>
			</div>

			<h1>{data.problem.name}</h1>
			<Markdown source={data.problem.description} />

			<h2>{$t("problem.input")}</h2>
			{#if data.problem.input}
				<Markdown source={data.problem.input} />
			{:else}
				<p>There is no input.</p>
			{/if}

			<h2>{$t("problem.output")}</h2>
			{#if data.problem.output}
				<Markdown source={data.problem.output} />
			{:else}
				<p>There is no output.</p>
			{/if}

			<h2>{$t("problem.samples")}</h2>
			{#each data.problem.testcase as testcase, i}
				{#if testcase.sample}
					<h3>{$t("problem.sample")} #{i}</h3>
					<Markdown source={testcase.description} />
					<table class="w-full">
						<thead>
							<tr>
								<th>{$t("problem.input")}</th>
								<th>{$t("problem.output")}</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td>
									<Code text={testcase.stdin} />
								</td>
								<td>
									<Code text={testcase.stdout} />
								</td>
							</tr>
						</tbody>
					</table>
				{/if}
			{/each}

			<h2>{$t("problem.testcases")}</h2>
			<table class="table w-full">
				<thead>
					<tr>
						<th>{$t("problem.id")}</th>
						<th>{$t("problem.description")}</th>
						<th>{$t("problem.score")}</th>
					</tr>
				</thead>
				<tbody>
					{#each data.problem.testcase as testcase, i}
						<tr class="hover">
							<th class="transition-all">{i}</th>
							<td class="transition-all">
								{#if testcase.sample}
									{$t("problem.see-sample")} #{i}
								{:else if testcase.description}
									<Markdown source={testcase.description} isInline />
								{:else}
									{$t("problem.no-description")}
								{/if}
							</td>
							<td class="transition-all">{testcase.score}</td>
						</tr>
					{/each}
				</tbody>
			</table>

			<h2>{$t("problem.policies")}</h2>
			<table class="table w-full">
				<thead>
					<tr>
						<th>{$t("problem.id")}</th>
						<th>{$t("problem.limits")}</th>
						<th>{$t("problem.score")}</th>
					</tr>
				</thead>
				<tbody>
					{#each data.problem.policy as policy, i}
						<tr class="hover">
							<th class="transition-all">{i}</th>
							<td class="transition-all">
								${policy.budget}, {policy.memory}MB
							</td>
							<td class="transition-all">{policy.score}</td>
						</tr>
					{/each}
				</tbody>
			</table>

			<p>
				{$t("problem.total-score", { values: { total_score } })}
			</p>

			<h2>{$t("problem.hint")}</h2>
			{#if data.problem.hint}
				<Markdown source={data.problem.hint} />
			{:else}
				<p>{$t("problem.no-hint")}</p>
			{/if}
		</div>
	</div>
</div>
