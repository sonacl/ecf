<script>
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { appState } from '$lib/state.svelte.js';
  import '../app.css';
  let { children } = $props();
  onMount(() => {
    if (browser) {
      const token = localStorage.getItem('token');
      const username = localStorage.getItem('username');
      if (token) {
        appState.token = token;
        appState.username = username;
      }
    }
  });

  const totalUnread = $derived.by(() => {
    let total = 0;
    if (appState.unreadMessages) {
      Object.values(appState.unreadMessages).forEach((v) => (total += v || 0));
    }
    if (appState.groups) {
      appState.groups.forEach((g) => (total += g.unread_count || 0));
    }
    return total;
  });

  $effect(() => {
    if (browser) {
      const count = totalUnread;
      document.title = count > 0 ? `(${count > 99 ? '99+' : count}) Enchatted` : 'Enchatted';
    }
  });
</script>

<svelte:head>
  <title>Enchatted</title>
  <meta
    name="description"
    content="A private, community-focused chat platform for friends and teams."
  />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link
    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Outfit:wght@400;500;600;700;800;900&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<div
  id="_encFontPreloader"
  aria-hidden="true"
  style="position:absolute;left:-9999px;top:-9999px;visibility:hidden;pointer-events:none;font-size:1px;"
>
  <span style="font-family:'EncPixel',monospace;">.</span>
  <span style="font-family:'EncComic',cursive;">.</span>
  <span style="font-family:'EncTypewriter',monospace;">.</span>
  <span style="font-family:'EncDigital',monospace;">.</span>
  <span style="font-family:'EncBold',sans-serif;">.</span>
</div>

{@render children()}
