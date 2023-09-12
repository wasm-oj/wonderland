<script lang="ts">
	import { page } from "$app/stores";
	import { sync } from "$lib/action/file-sync";
	import Head from "$lib/component/Head.svelte";
	import Code from "$lib/md/Code.svelte";
	import Markdown from "$lib/md/Markdown.svelte";
	import { t } from "svelte-i18n";
	import { superForm } from "sveltekit-superforms/client";
	import Icon from "@iconify/svelte";
	import type { PageData } from "./$types";
	import { schema } from "./schema";

	export let data: PageData;

	let error = "";
	const { form, enhance, constraints, submitting } = superForm(data.form, {
		multipleSubmits: "prevent",
		taintedMessage: false,
		onError: (evt) => {
			error = evt.result.error.message;
		},
	});

	const total_score =
		data.problem.testcase.reduce((acc, cur) => acc + cur.score, 0) *
		data.problem.policy.reduce((acc, cur) => acc + cur.score, 0);

	const langs = {
		Rust: "rs",
		C: "c",
		"C++": "cpp",
	};
</script>

<Head title="Submit to {data.problem.name}" description={data.problem.description} />

<div class="h-full w-full overflow-auto">
	<div class="flex w-full items-center justify-center gap-4 px-4 max-lg:flex-col lg:items-start">
		<div class="prose max-h-screen w-full overflow-auto py-20 max-lg:hidden">
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

		<div class="divider max-h-screen pb-4 pt-20 lg:divider-horizontal max-lg:hidden" />

		<div class="prose w-full pt-20 lg:hidden">
			<h1>{data.problem.name}</h1>

			<p>
				{$t("problem.total-score", { values: { total_score } })}
			</p>
		</div>

		<form class="form-control w-full max-w-2xl lg:py-20" method="POST" use:enhance>
			<label class="label" for="lang">
				<span class="label-text">{$t("submit.language")}</span>
			</label>

			<select
				name="lang"
				bind:value={$form.lang}
				{...$constraints.lang}
				class="select-bordered select w-full"
			>
				<option disabled selected>{$t("submit.select-language")}</option>
				{#each Object.entries(schema["shape"]["lang"]["enum"]) as [display, value]}
					<option value={langs[value]}>{display}</option>
				{/each}
			</select>

			<label class="label" for="code">
				<span class="label-text">{$t("submit.code")}</span>
				<span class="label-text">
					<input
						id="code-file"
						type="file"
						class="hidden"
						use:sync={(content) => ($form.code = content)}
					/>
					<label for="code-file" class="cursor-pointer">
						<Icon icon="octicon:upload-16" class="inline-block" />
						{$t("submit.upload")}
					</label>
				</span>
			</label>

			<textarea
				name="code"
				bind:value={$form.code}
				{...$constraints.code}
				class="textarea-bordered textarea h-80 w-full resize-y font-mono"
			/>

			<div class="divider" />

			<button
				class="btn-primary btn"
				class:animate-pulse={$submitting}
				disabled={$form.lang === $t("submit.select-language") || !$form.code || $submitting}
				>{$t("submit.submit")}</button
			>

			{#if error}
				<div class="alert alert-error my-4 overflow-auto whitespace-pre font-mono">
					{error}
				</div>
			{/if}
		</form>
	</div>
</div>
