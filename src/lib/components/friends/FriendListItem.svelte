<script>
    import Avatar from "../ui/Avatar.svelte";
    import Icon from "../ui/Icon.svelte";
    import { appState } from "$lib/stores/index.svelte.js";
    let { username, actions = [], statusOverride = null } = $props();
    const profile = $derived(appState.profileCache[username]);
    const isOnline = $derived(appState.onlineUsers.has(username));
    const displayName = $derived(profile?.display_name || username);
    const status = $derived(
        statusOverride || (isOnline ? "Online" : "Offline"),
    );
</script>
<li class="fp-item">
    <Avatar
        src={profile?.profile_picture}
        initials={username?.charAt(0)}
        size="40px"
        status={isOnline ? profile?.custom_status || "online" : "offline"}
    />
    <div class="fp-item-info">
        <span class="fp-item-name font-{profile?.display_name_font || 'normal'} {profile?.is_enchanted ? 'enchanted-text' : ''}">
            {displayName}
            {#if profile?.official}
                <img src="/enchatted/web_assets/official.gif" alt="Official" title="Official account of this person" class="inline-badge" style="width: 14px; height: 14px; margin-left: 4px;" />
            {/if}
        </span>
        <span class="fp-item-sub">{status}</span>
    </div>
    <div class="fp-item-actions">
        {#each actions as action}
            <button
                class="fp-action-btn {action.variant || ''}"
                title={action.title}
                onclick={action.onClick}
            >
                <Icon name={action.icon} size="18" />
            </button>
        {/each}
    </div>
</li>
<style>
    .fp-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 8px;
        border-radius: 8px;
        border-top: 1px solid var(--border-light);
        transition: background 0.1s;
        cursor: default;
    }
    .fp-item:first-child {
        border-top: none;
    }
    .fp-item:hover {
        background: var(--bg-modifier-hover);
    }
    .fp-item-info {
        flex: 1;
        min-width: 0;
    }
    .fp-item-name {
        display: block;
        font-size: 0.95rem;
        font-weight: 600;
        color: var(--text-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .fp-item-sub {
        font-size: 0.8rem;
        color: var(--text-muted);
    }
    .fp-item-actions {
        display: flex;
        gap: 6px;
        flex-shrink: 0;
        opacity: 0;
        transition: opacity 0.15s;
    }
    .fp-item:hover .fp-item-actions {
        opacity: 1;
    }
    .fp-action-btn {
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background: var(--bg-secondary);
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        transition:
            background 0.1s,
            color 0.1s;
    }
    .fp-action-btn:hover {
        background: var(--bg-tertiary);
        color: var(--text-primary);
    }
    .fp-action-btn.accept {
        color: var(--success-color);
    }
    .fp-action-btn.accept:hover {
        background: rgba(67, 181, 129, 0.15);
    }
    .fp-action-btn.danger:hover {
        color: var(--danger-color);
        background: rgba(240, 71, 71, 0.1);
    }
</style>
