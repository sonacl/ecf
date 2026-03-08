<script>
    import Icon from "../ui/Icon.svelte";
    let {
        name,
        icon = null,
        active = false,
        variant = "purple",
        onClick,
    } = $props();
</script>
<button
    class="server-icon {active ? 'active' : ''}"
    onclick={onClick}
    title={name}
    aria-label={name}
>
    <div class="pill"></div>
    <div class="box {active ? 'active' : ''} {variant}">
        {#if icon}
            <Icon name={icon} size="28" />
        {:else}
            {name.charAt(0)}
        {/if}
    </div>
</button>
<style>
    .server-icon {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 48px;
        width: 72px;
        cursor: pointer;
        margin-bottom: 8px;
        background: transparent;
        border: none;
        padding: 0;
        font-family: inherit;
    }
    .pill {
        position: absolute;
        left: 0;
        width: 4px;
        height: 8px;
        background-color: white;
        border-radius: 0 4px 4px 0;
        transition:
            height 0.2s,
            background-color 0.2s;
        opacity: 0;
    }
    .server-icon:hover .pill {
        opacity: 1;
        height: 20px;
    }
    .active .pill {
        opacity: 1;
        height: 40px;
    }
    .box {
        height: 48px;
        width: 48px;
        background-color: var(--bg-secondary);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        color: var(--text-normal);
        transition: all 0.2s;
    }
    .box.green {
        color: var(--success-color);
    }
    .server-icon:hover .box.green {
        background-color: var(--success-color);
        color: white;
    }
    .server-icon:hover .box {
        border-radius: 16px;
        background-color: var(--accent-primary);
        color: white;
    }
    .active .box {
        border-radius: 16px;
        background-color: var(--accent-primary);
        color: white;
    }
</style>
