<script>
	import { onMount } from "svelte";
	import { browser } from "$app/environment";
	import { appState } from "$lib/state.svelte.js";
	import "../app.css";
	let { children } = $props();
	onMount(() => {
		if (browser) {
			const token = localStorage.getItem("token");
			const username = localStorage.getItem("username");
			if (token) {
				appState.token = token;
				appState.username = username;
			}
		}
	});
</script>
<svelte:head>
	<title>Enchatted</title>
	<meta name="description" content="A private, community-focused chat platform for friends and teams." />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link
		rel="preconnect"
		href="https://fonts.gstatic.com"
		crossorigin="anonymous"
	/>
	<link
		href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Outfit:wght@400;500;600;700;800;900&display=swap"
		rel="stylesheet"
	/>
</svelte:head>
{@render children()}
