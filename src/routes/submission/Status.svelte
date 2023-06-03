<script lang="ts">
	export let status: string;
</script>

<span
	class:animate-pulse={status === "running"}
	class:text-success={status === "AC"}
	class:font-bold={status === "AC"}
	class:text-error={status === "WA"}
	class:text-warning={status === "SLE" || status === "MLE" || status === "RE"}
>
	{status}
</span>
