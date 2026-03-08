<script>
    import Icon from "./Icon.svelte";
    let {
        icon = "lucide:message-circle",
        title,
        subtitle,
        size = "56",
    } = $props();
</script>
<div class="empty-state">
    <div class="empty-content">
        <div class="empty-icon">
            <Icon name={icon} {size} />
        </div>
        {#if title}
            <h2>{title}</h2>
        {/if}
        {#if subtitle}
            <p>{subtitle}</p>
        {/if}
    </div>
</div>
<style>
    .empty-state {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .empty-content {
        text-align: center;
        max-width: 320px;
    }
    .empty-icon {
        color: var(--text-muted);
        opacity: 0.4;
        margin-bottom: 20px;
    }
    .empty-content h2 {
        color: var(--text-primary);
        font-size: 1.3rem;
        font-weight: 700;
        margin-bottom: 8px;
    }
    .empty-content p {
        color: var(--text-muted);
        font-size: 0.9rem;
        line-height: 1.5;
    }
</style>
