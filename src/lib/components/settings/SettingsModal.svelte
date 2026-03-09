<script>
    import { browser } from "$app/environment";
    import { goto } from "$app/navigation";
    import Icon from "../ui/Icon.svelte";
    import ProfileSettingsTab from "./ProfileSettingsTab.svelte";
    import PasswordSettingsTab from "./PasswordSettingsTab.svelte";
    import { appState } from "$lib/stores/index.svelte.js";
    import { api } from "$lib/utils/api.js";
    let { open = false, onClose } = $props();
    let activeTab = $state("profile");
    const tabs = [
        { id: "profile", label: "My Account", icon: "lucide:user" },
        { id: "password", label: "Security", icon: "lucide:shield" },
        { id: "logout", label: "Log Out", icon: "lucide:log-out" },
    ];
    function performLogout() {
        if (browser) {
            api.auth.logout?.();
            localStorage.removeItem("token");
            localStorage.removeItem("username");
            localStorage.removeItem("_enc_e");
            localStorage.removeItem("_enc_p");
            appState.token = null;
            appState.username = null;
        }
        goto("/login");
    }
    function handleBackdropClick(e) {
        if (e.target === e.currentTarget) onClose?.();
    }
    function handleTabClick(tabId) {
        if (tabId === "logout") {
            performLogout();
            return;
        }
        activeTab = tabId;
    }
</script>

{#if open}
    <div
        class="modal-backdrop"
        onclick={handleBackdropClick}
        onkeydown={(e) =>
            (e.key === "Enter" || e.key === " ") && handleBackdropClick(e)}
        role="button"
        tabindex="0"
        aria-label="Close settings"
    >
        <div class="settings-box">
            <nav class="settings-sidebar">
                <div class="sidebar-title">User Settings</div>
                {#each tabs as tab}
                    <button
                        class="settings-tab"
                        class:active={activeTab === tab.id}
                        class:logout={tab.id === "logout"}
                        onclick={() => handleTabClick(tab.id)}
                    >
                        <Icon name={tab.icon} size="16" />
                        {tab.label}
                    </button>
                {/each}
            </nav>
            <div class="settings-content">
                <button class="close-btn" onclick={onClose}>
                    <Icon name="lucide:x" size="20" />
                </button>
                {#if activeTab === "profile"}
                    <ProfileSettingsTab />
                {:else if activeTab === "password"}
                    <PasswordSettingsTab />
                {/if}
            </div>
        </div>
    </div>
{/if}

<style>
    .modal-backdrop {
        position: fixed;
        inset: 0;
        z-index: 1000;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.15s ease;
    }
    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
    .settings-box {
        display: flex;
        width: 740px;
        max-width: 95vw;
        height: 520px;
        max-height: 90vh;
        background: var(--bg-primary);
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 24px 64px rgba(0, 0, 0, 0.5);
    }
    .settings-sidebar {
        width: 200px;
        background: var(--bg-secondary);
        padding: 16px 8px;
        display: flex;
        flex-direction: column;
        gap: 2px;
        flex-shrink: 0;
    }
    .sidebar-title {
        font-size: 0.7rem;
        font-weight: 700;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        padding: 8px 10px 12px;
    }
    .settings-tab {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 10px;
        background: transparent;
        border: none;
        border-radius: 4px;
        color: var(--text-secondary);
        font-size: 0.9rem;
        cursor: pointer;
        transition:
            background 0.1s,
            color 0.1s;
        text-align: left;
        width: 100%;
    }
    .settings-tab:hover {
        background: var(--bg-modifier-hover);
        color: var(--text-primary);
    }
    .settings-tab.active {
        background: var(--bg-modifier-selected);
        color: var(--text-primary);
    }
    .settings-tab.logout {
        color: var(--danger-color);
        margin-top: auto;
    }
    .settings-tab.logout:hover {
        background: rgba(240, 71, 71, 0.1);
    }
    .settings-content {
        flex: 1;
        padding: 32px 40px;
        overflow-y: auto;
        position: relative;
    }
    .close-btn {
        position: absolute;
        top: 16px;
        right: 16px;
        background: transparent;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        padding: 6px;
        border-radius: 50%;
        transition:
            background 0.1s,
            color 0.1s;
        z-index: 10;
    }
    .close-btn:hover {
        background: var(--bg-modifier-hover);
        color: var(--text-primary);
    }
</style>
