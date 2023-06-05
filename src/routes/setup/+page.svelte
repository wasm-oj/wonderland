<script lang="ts">
	import { ConfigSchema } from "$lib/schema";
	import { superForm } from "sveltekit-superforms/client";
	import { ZodError } from "zod";
	import type { PageData } from "./$types";

	export let data: PageData;

	let error = "";
	const { form, enhance, submitting } = superForm(data.form, {
		dataType: "json",
		multipleSubmits: "prevent",
		onError: (evt) => {
			error = evt.result.error.message;
		},
	});

	let json = JSON.stringify($form, null, 4);
	$: {
		try {
			$form = ConfigSchema.parse(JSON.parse(json));
			error = "";
		} catch (err) {
			if (err instanceof ZodError) {
				error = err.errors
					.map((e) => `${e.path.join(".")}: ${e.message} (${e.code})`)
					.join("\n---\n");
			} else if (err instanceof Error) {
				error = err.message;
			}
		}
	}
</script>

<div class="h-full w-full overflow-auto">
	<div class="flex w-full items-center justify-center gap-4 px-4">
		<form class="form-control w-full max-w-2xl py-20" method="POST" use:enhance>
			<label class="label" for="config">
				<span class="label-text">Config</span>
			</label>
			<textarea
				id="config"
				bind:value={json}
				class="textarea-bordered textarea h-80 w-full resize-y font-mono"
			/>

			<div class="divider" />

			<button class="btn" class:animate-pulse={$submitting} disabled={!!error || $submitting}>
				Save
			</button>

			{#if error}
				<div class="alert alert-error my-4 overflow-auto whitespace-pre font-mono">
					{error}
				</div>
			{/if}
		</form>
	</div>
</div>
