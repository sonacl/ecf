<script>
    import Icon from "../ui/Icon.svelte";
    import Button from "../ui/Button.svelte";
    import Input from "../ui/Input.svelte";
    import Avatar from "../ui/Avatar.svelte";
    import { api } from "$lib/utils/api.js";
    import { appState } from "$lib/stores/index.svelte.js";
    import { toastError, toastSuccess } from "$lib/utils/toast.svelte.js";
    let { open = false, serverId, onClose, onUpdated } = $props();
    let server = $derived(appState.servers.find((s) => s.id === serverId));
    let name = $state("");
    let description = $state("");
    let activeTab = $state("overview");
    let channels = $state([]);
    let inviteCode = $state("");
    let members = $state([]);
    let loading = $state(false);
    $effect(() => {
        if (open && server) {
            name = server.name;
            description = server.description || "";
            loadChannels();
            loadInvite();
            loadMembers();
        }
    });
    async function loadMembers() {
        try {
            const res = await api.servers.getMembers(serverId);
            members = Array.isArray(res?.members)
                ? res.members
                : Array.isArray(res)
                  ? res
                  : [];
        } catch (e) {
            console.error("Failed to load members:", e);
        }
    }
    async function loadChannels() {
        try {
            const res = await api.servers.getChannels(serverId);
            channels = Array.isArray(res?.channels)
                ? res.channels
                : Array.isArray(res)
                  ? res
                  : [];
        } catch (e) {
            console.error("Failed to load channels:", e);
        }
    }
    async function loadInvite() {
        try {
            const res = await api.servers.getInvite(serverId);
            inviteCode = res?.invite_code || "";
        } catch (e) {
            console.error("Failed to load invite:", e);
        }
    }
    async function handleUpdate(e) {
        e.preventDefault();
        loading = true;
        try {
            await api.servers.update(serverId, { name, description });
            toastSuccess("Success", "Server updated successfully.");
            onUpdated?.();
            onClose?.();
        } catch (err) {
            toastError("Error", err.message);
        } finally {
            loading = false;
        }
    }
    async function handleDelete() {
        if (
            !confirm(
                "Are you sure you want to delete this server? This cannot be undone.",
            )
        )
            return;
        loading = true;
        try {
            await api.servers.delete(serverId);
            appState.servers = appState.servers.filter(
                (s) => s.id !== serverId,
            );
            appState.activeServerId = null;
            toastSuccess("Deleted", "Server has been deleted.");
            onClose?.();
        } catch (err) {
            toastError("Error", err.message);
        } finally {
            loading = false;
        }
    }
    async function handleLeave() {
        if (!confirm("Are you sure you want to leave this server?")) return;
        loading = true;
        try {
            await api.servers.leave(serverId);
            appState.servers = appState.servers.filter(
                (s) => s.id !== serverId,
            );
            appState.activeServerId = null;
            toastSuccess("Left Server", `You have left ${server?.name}.`);
            onClose?.();
        } catch (err) {
            toastError("Error", err.message);
        } finally {
            loading = false;
        }
    }
    let newChannelName = $state("");
    async function handleCreateChannel(e) {
        e.preventDefault();
        if (!newChannelName.trim()) return;
        try {
            await api.servers.createChannel(
                serverId,
                newChannelName.trim(),
                "",
            );
            toastSuccess("Channel Created", `#${newChannelName}`);
            newChannelName = "";
            loadChannels();
        } catch (err) {
            toastError("Error", err.message);
        }
    }
    function handleBackdropClick(e) {
        if (e.target === e.currentTarget) onClose?.();
    }
    function handleKeyDown(e) {
        if (e.key === "Escape") onClose?.();
    }
</script>
{#if open && server}
    <div
        class="modal-backdrop"
        onclick={handleBackdropClick}
        onkeydown={handleKeyDown}
        role="dialog"
        aria-modal="true"
        tabindex="-1"
    >
        <div class="settings-modal flex-box">
            <aside class="settings-sidebar">
                <div class="sidebar-header">
                    <h3>{server.name}</h3>
                    <span>Server Settings</span>
                </div>
                <nav class="sidebar-nav">
                    <button
                        class:active={activeTab === "overview"}
                        onclick={() => (activeTab = "overview")}
                        >Overview</button
                    >
                    <button
                        class:active={activeTab === "channels"}
                        onclick={() => (activeTab = "channels")}
                        >Channels</button
                    >
                    <button
                        class:active={activeTab === "members"}
                        onclick={() => (activeTab = "members")}>Members</button
                    >
                    <div class="nav-divider"></div>
                    {#if server.owner === appState.username}
                        <button class="danger" onclick={handleDelete}
                            >Delete Server</button
                        >
                    {:else}
                        <button class="danger" onclick={handleLeave}
                            >Leave Server</button
                        >
                    {/if}
                </nav>
            </aside>
            <main class="settings-content">
                <header class="content-header">
                    <h2>
                        {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                    </h2>
                    <button class="close-btn" onclick={onClose}>
                        <Icon name="lucide:x" size="24" />
                        <span>ESC</span>
                    </button>
                </header>
                <div class="content-body">
                    {#if activeTab === "overview"}
                        <form onsubmit={handleUpdate}>
                            <div class="overview-grid">
                                <div class="avatar-edit">
                                    <Avatar
                                        initials={name.charAt(0)}
                                        size="100px"
                                    />
                                    <p>
                                        We recommend an image of at least
                                        512x512 for the server.
                                    </p>
                                    <Button variant="secondary" size="sm"
                                        >Upload Image</Button
                                    >
                                </div>
                                <div class="info-edit">
                                    <Input
                                        id="s-name"
                                        label="Server Name"
                                        bind:value={name}
                                        required
                                    />
                                    <Input
                                        id="s-desc"
                                        type="textarea"
                                        label="Description"
                                        bind:value={description}
                                    />
                                    {#if inviteCode}
                                        <div class="form-group custom-invite">
                                            <span class="label-text"
                                                >Invite Code</span
                                            >
                                            <div class="invite-box">
                                                <code>{inviteCode}</code>
                                                <Button
                                                    size="sm"
                                                    onclick={() => {
                                                        navigator.clipboard.writeText(
                                                            inviteCode,
                                                        );
                                                        toastSuccess(
                                                            "Copied",
                                                            "Invite code copied to clipboard!",
                                                        );
                                                    }}>Copy</Button
                                                >
                                            </div>
                                        </div>
                                    {/if}
                                </div>
                            </div>
                            <div class="actions">
                                <Button type="submit" disabled={loading}
                                    >{loading
                                        ? "Saving..."
                                        : "Save Changes"}</Button
                                >
                            </div>
                        </form>
                    {:else if activeTab === "channels"}
                        <div class="channels-list">
                            <form
                                class="add-channel"
                                onsubmit={handleCreateChannel}
                            >
                                <input
                                    type="text"
                                    placeholder="New channel name"
                                    bind:value={newChannelName}
                                    class="basic-input"
                                />
                                <Button type="submit" size="sm"
                                    >Add Channel</Button
                                >
                            </form>
                            <ul>
                                {#each channels as channel}
                                    <li>
                                        <Icon name="lucide:hash" size="18" />
                                        <span>{channel.name}</span>
                                        <button
                                            class="icon-btn danger"
                                            title="Delete Channel"
                                        >
                                            <Icon
                                                name="lucide:trash-2"
                                                size="18"
                                            />
                                        </button>
                                    </li>
                                {/each}
                            </ul>
                        </div>
                    {:else if activeTab === "members"}
                        <div class="members-view">
                            <div class="members-header">
                                <h3>Total Members • {members.length}</h3>
                            </div>
                            <ul class="members-list">
                                {#each members as member}
                                    <li>
                                        <Avatar
                                            src={member.profile_picture}
                                            initials={member.username.charAt(0)}
                                            size="36px"
                                        />
                                        <div class="member-meta">
                                            <span class="username"
                                                >{member.username}</span
                                            >
                                            <span class="role"
                                                >{member.role || "Member"}</span
                                            >
                                        </div>
                                    </li>
                                {/each}
                            </ul>
                        </div>
                    {/if}
                </div>
            </main>
        </div>
    </div>
{/if}
<style>
    .modal-backdrop {
        position: fixed;
        inset: 0;
        z-index: 2000;
        background: var(--bg-primary);
        display: flex;
        animation: slideIn 0.2s ease-out;
    }
    @keyframes slideIn {
        from {
            transform: scale(1.1);
            opacity: 0;
        }
    }
    .flex-box {
        flex: 1;
        display: flex;
        max-width: 100vw;
    }
    .settings-sidebar {
        width: 32%;
        background: var(--bg-secondary);
        display: flex;
        justify-content: flex-end;
        padding-top: 60px;
    }
    .sidebar-header {
        padding: 0 20px 20px;
    }
    .sidebar-header h3 {
        font-size: 0.8rem;
        color: var(--text-muted);
        text-transform: uppercase;
        margin-bottom: 4px;
    }
    .sidebar-nav {
        width: 218px;
        padding: 0 10px;
    }
    .sidebar-nav button {
        width: 100%;
        text-align: left;
        padding: 8px 10px;
        background: transparent;
        border: none;
        border-radius: 4px;
        color: var(--text-secondary);
        font-size: 1rem;
        cursor: pointer;
        margin-bottom: 2px;
    }
    .sidebar-nav button:hover {
        background: var(--bg-modifier-hover);
        color: var(--text-normal);
    }
    .sidebar-nav button.active {
        background: var(--bg-modifier-selected);
        color: var(--text-primary);
    }
    .sidebar-nav button.danger {
        color: var(--danger-color);
    }
    .sidebar-nav button.danger:hover {
        background: rgba(240, 71, 71, 0.1);
    }
    .nav-divider {
        height: 1px;
        background: var(--border-color);
        margin: 8px 10px;
    }
    .settings-content {
        flex: 1;
        background: var(--bg-primary);
        padding-top: 60px;
        padding-bottom: 60px;
        overflow-y: auto;
    }
    .content-header {
        max-width: 740px;
        padding: 0 40px;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 24px;
    }
    .content-header h2 {
        font-size: 1.2rem;
        font-weight: 700;
    }
    .close-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        background: transparent;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        transition: color 0.1s;
    }
    .close-btn:hover {
        color: var(--text-primary);
    }
    .close-btn span {
        font-size: 0.75rem;
        font-weight: 700;
    }
    .content-body {
        max-width: 740px;
        padding: 0 40px;
    }
    .overview-grid {
        display: grid;
        grid-template-columns: 100px 1fr;
        gap: 32px;
        margin-bottom: 32px;
    }
    .avatar-edit {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        text-align: center;
    }
    .avatar-edit p {
        font-size: 0.75rem;
        color: var(--text-muted);
    }
    .invite-box {
        display: flex;
        gap: 8px;
        background: var(--bg-tertiary);
        padding: 8px;
        border-radius: 4px;
        align-items: center;
    }
    .invite-box code {
        flex: 1;
        font-family: monospace;
        color: var(--accent-primary);
    }
    .channels-list ul {
        list-style: none;
        padding: 0;
        margin-top: 24px;
    }
    .channels-list li {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        background: var(--bg-secondary);
        border-radius: 4px;
        margin-bottom: 8px;
    }
    .channels-list li span {
        flex: 1;
    }
    .add-channel {
        display: flex;
        gap: 8px;
    }
    .basic-input {
        flex: 1;
        padding: 8px 12px;
        background: var(--bg-tertiary);
        border: none;
        border-radius: 4px;
        color: var(--text-primary);
    }
    .icon-btn {
        background: transparent;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
    }
    .icon-btn:hover {
        background: var(--bg-modifier-hover);
        color: var(--text-primary);
    }
    .label-text {
        display: block;
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--text-muted);
        text-transform: uppercase;
        margin-bottom: 8px;
    }
    .members-list {
        list-style: none;
        padding: 0;
        margin-top: 16px;
    }
    .members-list li {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px 12px;
        border-radius: 4px;
        transition: background 0.1s;
    }
    .members-list li:hover {
        background: var(--bg-modifier-hover);
    }
    .member-meta {
        display: flex;
        flex-direction: column;
    }
    .member-meta .username {
        font-weight: 600;
        color: var(--text-primary);
    }
    .member-meta .role {
        font-size: 0.75rem;
        color: var(--text-muted);
    }
    .members-header h3 {
        font-size: 0.75rem;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
</style>
