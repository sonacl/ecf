<script>
    import IconifyIcon from "@iconify/svelte";
    let { name = "", size = 24, ...props } = $props();
</script>
{#if name}
    <IconifyIcon icon={name} width={size} height={size} {...props} />
{/if}
