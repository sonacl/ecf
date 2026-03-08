<script>
    import Badge from "../../ui/Badge.svelte";
    let { enchantments } = $props();
</script>
{#if enchantments?.length > 0}
    <div class="section">
        <span class="section-title">Enchantments</span>
        <div class="badge-list">
            {#each enchantments as badge}
                <Badge type={badge.type} level={badge.level} />
            {/each}
        </div>
    </div>
{/if}
<style>
    .section {
        margin-top: 16px;
        padding-top: 4px;
    }
    .section-title {
        display: block;
        font-size: 0.72rem;
        font-weight: 800;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.08em;
        margin-bottom: 10px;
    }
    .badge-list {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
    }
</style>
