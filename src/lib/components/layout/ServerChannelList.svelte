<script>
    import Icon from "../ui/Icon.svelte";
    import ChannelItem from "./ChannelItem.svelte";
    import { appState } from "$lib/stores/index.svelte.js";
    let { onCreateChannel, onCreateGroup, onServerSettings } = $props();
    const activeServer = $derived(
        appState.servers.find((s) => s.id === appState.activeServerId),
    );
    const channels = $derived(
        appState.activeServerId
            ? appState.serverChannels[appState.activeServerId] || []
            : [],
    );
    const groups = $derived(
        appState.serverGroups[appState.activeServerId] || [],
    );
    const uncategorized = $derived(channels.filter((c) => !c.group_id));
</script>

<button
    class="server-name-header"
    onclick={onServerSettings}
    aria-label="Server settings for {activeServer?.name}"
>
    <h3>{activeServer?.name || "Server"}</h3>
    <Icon name="lucide:chevron-down" size="18" />
</button>
<div class="scroller">
    <div class="section-divider">
        <span>Channels</span>
        <div class="header-actions">
            <button
                class="add-btn"
                title="Create Category"
                onclick={onCreateGroup}
            >
                <Icon name="lucide:folder-plus" size="14" />
            </button>
            <button
                class="add-btn"
                title="Create Channel"
                onclick={onCreateChannel}
            >
                <Icon name="lucide:plus" size="14" />
            </button>
        </div>
    </div>
    <ul class="channel-list-items">
        {#if groups.length > 0}
            {#each groups as group}
                <li class="group-header">
                    <Icon name="lucide:chevron-down" size="12" />
                    <span>{group.name}</span>
                </li>
                {#each channels.filter((c) => c.group_id === group.id) as channel (channel.id)}
                    <ChannelItem {channel} />
                {/each}
            {/each}
            {#if uncategorized.length > 0}
                <li class="group-header">
                    <span>UNCATEGORIZED</span>
                </li>
                {#each uncategorized as channel (channel.id)}
                    <ChannelItem {channel} />
                {/each}
            {/if}
        {:else}
            {#each channels as channel (channel.id)}
                <ChannelItem {channel} />
            {/each}
        {/if}
    </ul>
</div>

<style>
    .server-name-header {
        height: 48px;
        padding: 0 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid var(--border-color);
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        cursor: pointer;
        transition: background 0.1s;
    }
    .server-name-header:hover {
        background-color: var(--bg-modifier-hover);
    }
    .server-name-header h3 {
        font-size: 0.95rem;
        font-weight: 700;
        color: var(--text-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .scroller {
        flex: 1;
        overflow-y: auto;
    }
    .section-divider {
        padding: 16px 8px 8px 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    .section-divider span {
        font-size: 0.75rem;
        font-weight: 800;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.02em;
    }
    .header-actions {
        display: flex;
        gap: 4px;
    }
    .channel-list-items {
        list-style: none;
        padding: 8px;
        margin: 0;
    }
    .group-header {
        padding: 18px 8px 4px 8px;
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--text-muted);
        text-transform: uppercase;
        cursor: pointer;
        transition: color 0.1s;
    }
    .group-header:first-of-type {
        padding-top: 8px;
    }
    .group-header:hover {
        color: var(--text-primary);
    }
    .add-btn {
        background: none;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.1s;
    }
    .add-btn:hover {
        color: var(--text-primary);
        background: rgba(255, 255, 255, 0.05);
    }
</style>
