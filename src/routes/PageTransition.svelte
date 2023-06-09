<script lang="ts">
	import { afterNavigate, beforeNavigate } from "$app/navigation";
	import { page } from "$app/stores";
	import { fade } from "svelte/transition";

	let show_content = true;
	beforeNavigate((nav) => {
		console.log(nav.from?.url.pathname, nav.to?.url.pathname);
		if (
			!nav.willUnload &&
			nav.type === "goto" &&
			nav.from?.url.pathname === nav.to?.url.pathname
		) {
			return;
		}
		show_content = false;
	});
	afterNavigate(() => (show_content = true));
</script>

{#key $page.url.pathname}
	{#if show_content}
		<div
			class="h-full w-full"
			in:fade={{ duration: 100, delay: 100 }}
			out:fade={{ duration: 100 }}
		>
			<slot />
		</div>
	{/if}
{/key}
