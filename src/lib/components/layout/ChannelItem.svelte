<script>
    import Icon from "../ui/Icon.svelte";
    import { appState } from "$lib/stores/index.svelte.js";
    let { channel } = $props();
    const isActive = $derived(appState.currentChat === `channel:${channel.id}`);
</script>
<li class:active={isActive}>
    <button onclick={() => (appState.currentChat = `channel:${channel.id}`)}>
        <Icon
            name={channel.is_mod_only ? "lucide:shield" : "lucide:hash"}
            size="20"
            class="text-muted"
        />
        <span class="name">{channel.name}</span>
    </button>
</li>
<style>
    li {
        margin-bottom: 2px;
    }
    button {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 8px;
        background: transparent;
        border: none;
        border-radius: 4px;
        color: var(--text-muted);
        cursor: pointer;
        font-size: 0.95rem;
        text-align: left;
        transition: all 0.1s;
    }
    li:hover button {
        background-color: var(--bg-modifier-hover);
        color: var(--text-normal);
    }
    li.active button {
        background-color: var(--bg-modifier-selected);
        color: var(--text-primary);
    }
    .name {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
</style>
