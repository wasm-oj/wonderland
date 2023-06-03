<script lang="ts">
	import { page } from "$app/stores";
	import { t } from "svelte-i18n";
	import Icon from "@iconify/svelte";
	import "../app.css";
	import type { PageData } from "./$types";
	import PageTransition from "./PageTransition.svelte";

	export let data: PageData;
</script>

<div class="group fixed left-0 top-0 z-20 w-full p-2">
	<nav class="navbar -top-8 rounded-lg bg-base-100 shadow-lg transition-all group-hover:top-0">
		<div class="top-3 flex-1 transition-all group-hover:top-0">
			<a class="btn-ghost btn text-xl normal-case" href="/"> WOW </a>
		</div>
		<div class="top-3 flex-none transition-all group-hover:top-0">
			<ul class="menu menu-horizontal px-1">
				<li>
					<a href="/problem">
						<Icon icon="octicon:apps-16" inline />
						<span class="hidden sm:inline-block">{$t("nav.problem")}</span>
					</a>
				</li>
				<li>
					<a href="/submission">
						<Icon icon="octicon:git-commit-16" inline />
						<span class="hidden sm:inline-block">{$t("nav.submission")}</span>
					</a>
				</li>
				<li class:hidden={!!data.token}>
					<a href="https://pea.csie.cool/app/woj?cb={$page.url.origin}/auth">
						<Icon icon="octicon:sign-in-16" inline />
						<span class="hidden sm:inline-block">{$t("nav.login")}</span>
					</a>
				</li>
			</ul>
		</div>
	</nav>
</div>

<PageTransition>
	<slot />
</PageTransition>
