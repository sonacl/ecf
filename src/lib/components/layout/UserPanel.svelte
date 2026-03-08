<script>
    import Avatar from "../ui/Avatar.svelte";
    import Icon from "../ui/Icon.svelte";
    import { appState, uiState } from "$lib/state.svelte.js";
    let { onSettings } = $props();
</script>

<footer class="user-panel">
    <button
        class="user-info"
        onclick={() => (uiState.viewingProfile = appState.username)}
        aria-label="View your profile"
    >
        <Avatar
            src={appState.user?.profile_picture}
            initials={appState.username?.charAt(0)}
            size="32px"
            status={appState.user?.custom_status || "online"}
            dotBorder="var(--bg-secondary)"
        />
        <div class="meta">
            <span class="display-name">
                {appState.user?.display_name ||
                    appState.username ||
                    "Connecting..."}
            </span>
            <span class="status-msg">
                {appState.user?.custom_status
                    ? appState.user.custom_status.charAt(0).toUpperCase() +
                      appState.user.custom_status.slice(1)
                    : "Online"}
            </span>
        </div>
    </button>
    <div class="user-actions">
        <button title="User Settings" onclick={onSettings}>
            <Icon name="lucide:settings" size="18" />
        </button>
    </div>
</footer>

<style>
    .user-panel {
        height: 52px;
        background-color: rgba(0, 0, 0, 0.2);
        padding: 0 8px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
    }
    .user-info {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 1;
        min-width: 0;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: background 0.1s;
    }
    .user-info:hover {
        background: rgba(255, 255, 255, 0.05);
    }
    .meta {
        display: flex;
        flex-direction: column;
        line-height: 1.2;
        overflow: hidden;
    }
    .display-name {
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--text-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .status-msg {
        font-size: 0.75rem;
        color: var(--text-muted);
    }
    .user-actions {
        display: flex;
        gap: 2px;
    }
    .user-actions button {
        background: transparent;
        border: none;
        color: var(--text-muted);
        padding: 6px;
        cursor: pointer;
        border-radius: 4px;
        display: flex;
        align-items: center;
        transition:
            color 0.1s,
            background 0.1s;
    }
    .user-actions button:hover {
        color: var(--text-primary);
        background: rgba(255, 255, 255, 0.05);
    }
</style>
