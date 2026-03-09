<script>
    import Icon from "../ui/Icon.svelte";
    import { uiState } from "$lib/stores/index.svelte.js";
    let { channelName = "general", isDM = false, subtitle = "", official = false } = $props();
</script>
<header class="chat-header flex items-center justify-between px-4">
    <div class="flex items-center gap-2 overflow-hidden">
        <button
            class="mobile-menu-btn"
            title="Open Sidebar"
            onclick={() => (uiState.mobileSidebarOpen = true)}
        >
            <Icon name="lucide:menu" size="24" />
        </button>
        <Icon
            name={isDM ? "lucide:at-sign" : "lucide:hash"}
            class="text-muted hide-tablet"
            size="24"
        />
        <div class="header-info flex items-center gap-2 overflow-hidden">
            <h2 class="title truncate">
                {channelName}
                {#if official}
                    <img src="/enchatted/web_assets/official.gif" alt="Official" class="inline-badge" style="width: 16px; height: 16px;" />
                {/if}
            </h2>
            {#if subtitle}
                <div class="divider"></div>
                <p
                    class="subtitle truncate {subtitle === 'Online'
                        ? 'online'
                        : 'text-muted'}"
                >
                    {subtitle}
                </p>
            {:else if isDM}
                <div class="divider"></div>
                <p class="subtitle text-muted truncate">Offline</p>
            {/if}
        </div>
    </div>
    <div class="header-actions flex items-center gap-4 text-muted">
        {#if isDM}
            <button
                class="action-btn"
                title="Toggle Sidebar"
                onclick={() => (uiState.sidebarOpen = !uiState.sidebarOpen)}
            >
                <Icon
                    name={uiState.sidebarOpen
                        ? "lucide:panel-right-close"
                        : "lucide:panel-right-open"}
                    size="20"
                />
            </button>
        {/if}
        <div class="search-box flex items-center gap-2 px-2 py-1 rounded">
            <input type="text" placeholder="Search" />
            <Icon name="lucide:search" size="16" />
        </div>
    </div>
</header>
<style>
    .chat-header {
        height: var(--header-height);
        border-bottom: 1px solid var(--border-strong);
        background-color: var(--bg-primary);
        flex-shrink: 0;
        z-index: 10;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }
    .title {
        font-weight: 700;
        font-size: 1rem;
        color: var(--text-header);
    }
    .divider {
        width: 1px;
        height: 24px;
        background-color: var(--bg-tertiary);
    }
    .subtitle {
        font-size: 0.8rem;
        font-weight: 500;
    }
    .subtitle.online {
        color: var(--success-color);
    }
    .action-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--text-muted);
        transition: color 0.1s;
    }
    .action-btn:hover {
        color: var(--text-normal);
    }
    .search-box {
        background-color: var(--bg-secondary);
        width: 144px;
        transition: width 0.2s;
    }
    .search-box:focus-within {
        width: 240px;
    }
    .search-box input {
        width: 100%;
        font-size: 0.85rem;
        color: var(--text-normal);
        background: none;
        border: none;
    }
    .search-box input::placeholder {
        color: var(--text-muted);
    }
    .mobile-menu-btn {
        display: none;
        padding: 4px;
        color: var(--text-muted);
        margin-right: 8px;
    }
    @media (max-width: 768px) {
        .mobile-menu-btn {
            display: flex;
        }
        :global(.hide-tablet) {
            display: none;
        }
        .search-box {
            display: none;
        }
    }
</style>
