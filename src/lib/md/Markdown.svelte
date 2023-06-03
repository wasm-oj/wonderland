<script lang="ts">
	import SvelteMarkdown from "svelte-markdown";
	import Code from "./Code.svelte";
	import Link from "./Link.svelte";

	export let source = "";
	export let isInline = false;
</script>

<SvelteMarkdown {source} {isInline} renderers={{ link: Link, code: Code }} />
