<script lang="ts">
	import hljs from "highlight.js";
	import "highlight.js/styles/atom-one-dark.css";
	import Icon from "@iconify/svelte";

	export let lang: string | undefined = undefined;
	export let text = "";

	function highlight(node: HTMLElement) {
		if (lang) {
			hljs.highlightElement(node);
		}

		return {
			destroy() {},
		};
	}

	let copied = false;
	async function copy() {
		await navigator.clipboard.writeText(text);
		copied = true;
		window.setTimeout(() => (copied = false), 1000);
	}
</script>

<div class="group">
	<pre class="w-full max-w-2xl overflow-auto whitespace-pre rounded-md" class:p-0={!!lang}><code
			class="language-{lang}"
			use:highlight>{text}</code
		></pre>
	<button
		class="btn-outline btn-sm btn absolute right-0 top-0 m-1 hidden group-hover:block"
		on:click={copy}
		class:btn-info={!copied}
		class:btn-success={copied}
	>
		{#if copied}
			<Icon icon="octicon:check-16" />
		{:else}
			<Icon icon="octicon:copy-16" />
		{/if}
	</button>
</div>
