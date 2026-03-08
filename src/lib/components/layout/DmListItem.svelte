<script>
    import Avatar from "../ui/Avatar.svelte";
    import { appState } from "$lib/state.svelte.js";
    let { friend, onSelect } = $props();
    const profile = $derived(appState.profileCache[friend]);
    const isOnline = $derived(appState.onlineUsers.has(friend));
    const displayName = $derived(profile?.display_name || friend);
    const status = $derived(
        isOnline ? profile?.custom_status || "online" : "offline",
    );
    const unread = $derived(appState.unreadMessages[friend] || 0);
    const isTyping = $derived(appState.isTyping[friend]);
    const isActive = $derived(appState.currentChat === friend);
</script>
{#if !appState.hiddenDms.has(friend)}
    <li class:active={isActive}>
        <button onclick={() => onSelect(friend)}>
            <div class="av-wrap">
                <Avatar
                    src={profile?.profile_picture}
                    initials={friend.charAt(0)}
                    size="32px"
                    {status}
                />
            </div>
            <span class="name">{displayName}</span>
            {#if unread > 0}
                <span class="badge red">{unread}</span>
            {/if}
            {#if isTyping}
                <div class="typing-pill">...</div>
            {/if}
        </button>
    </li>
{/if}
<style>
    li {
        margin-bottom: 2px;
    }
    button {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px 12px;
        background: transparent;
        border: none;
        border-radius: 4px;
        color: var(--text-secondary);
        cursor: pointer;
        font-size: 0.95rem;
        text-align: left;
        transition: all 0.1s;
    }
    li:hover button {
        background-color: rgba(255, 255, 255, 0.04);
        color: var(--text-primary);
    }
    li.active button {
        background-color: rgba(255, 255, 255, 0.08);
        color: var(--text-primary);
    }
    .av-wrap {
        flex-shrink: 0;
    }
    .name {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .badge {
        margin-left: auto;
        padding: 0 6px;
        border-radius: 10px;
        font-size: 0.75rem;
        font-weight: 700;
        color: white;
        min-width: 16px;
        text-align: center;
    }
    .badge.red {
        background-color: var(--danger-color);
    }
    .typing-pill {
        font-size: 1.2rem;
        color: var(--accent-primary);
        font-weight: bold;
        line-height: 0;
        margin-bottom: 8px;
    }
</style>
