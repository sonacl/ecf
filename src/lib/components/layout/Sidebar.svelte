<script>
    import Icon from "../ui/Icon.svelte";
    import ServerIcon from "./ServerIcon.svelte";
    import DmListItem from "./DmListItem.svelte";
    import Avatar from "../ui/Avatar.svelte";
    import UserPanel from "./UserPanel.svelte";
    import ServerChannelList from "./ServerChannelList.svelte";
    import SettingsModal from "../settings/SettingsModal.svelte";
    import CreateServerModal from "../servers/CreateServerModal.svelte";
    import CreateChannelModal from "../servers/CreateChannelModal.svelte";
    import CreateServerGroupModal from "../servers/CreateServerGroupModal.svelte";
    import CreateGroupModal from "../chat/CreateGroupModal.svelte";
    import ServerSettingsModal from "../servers/ServerSettingsModal.svelte";
    import { appState, uiState } from "$lib/state.svelte.js";
    import { api } from "$lib/utils/api.js";
    import { onMount } from "svelte";
    import { loadServerData } from "$lib/utils/chat.js";
    let settingsOpen = $state(false);
    let createServerOpen = $state(false);
    let createChannelOpen = $state(false);
    let createServerGroupOpen = $state(false);
    let createGroupOpen = $state(false);
    let serverSettingsOpen = $state(false);
    const activeServer = $derived(
        appState.servers.find((s) => s.id === appState.activeServerId),
    );
    function selectSection(id, type = "dm") {
        uiState.mobileSidebarOpen = false;
        if (type === "dm") {
            appState.activeServerId = null;
            appState.currentChat = id;
        } else if (type === "server") {
            appState.activeServerId = id;
            const channels = appState.serverChannels[id];
            if (channels?.length) {
                appState.currentChat = `channel:${channels[0].id}`;
            } else {
                appState.currentChat = null;
                loadServerData(id).then(() => {
                    const chs = appState.serverChannels[id];
                    if (chs?.length && !appState.currentChat) {
                        appState.currentChat = `channel:${chs[0].id}`;
                    }
                });
            }
        }
    }
    async function loadServers() {
        try {
            const res = await api.servers.list();
            appState.servers = Array.isArray(res?.servers)
                ? res.servers
                : Array.isArray(res)
                  ? res
                  : [];
        } catch (e) {
            console.error("Failed to load servers:", e);
        }
    }
    async function loadFriends() {
        try {
            const list = await api.friends.list();
            appState.friends = Array.isArray(list)
                ? list
                      .map((f) => (typeof f === "string" ? f : f.username))
                      .filter(Boolean)
                : [];
            appState.friends.forEach((f) => {
                if (!appState.profileCache[f]) {
                    api.profile
                        .getUser(f)
                        .then((u) => {
                            if (u) appState.profileCache[f] = u;
                        })
                        .catch(() => {});
                }
            });
        } catch (e) {
            console.error("Failed to load friends:", e);
        }
    }
    function handleServerCreated() {
        loadServers();
    }
    function handleChannelCreated(newChannel) {
        if (appState.activeServerId) {
            loadServerData(appState.activeServerId);
            appState.currentChat = `channel:${newChannel.id}`;
        }
    }
    function handleGroupCreated(newGroup) {
        appState.currentChat = `group:${newGroup.id}`;
    }
    async function closeDm(e, dmUser) {
        e.stopPropagation();
        try {
            await api.dms.close(dmUser);
            appState.dms = appState.dms.filter((d) => d.username !== dmUser);
            if (appState.currentChat === dmUser) {
                appState.currentChat = "friends";
            }
        } catch (err) {
            console.error("Failed to close DM", err);
        }
    }
    onMount(() => {
        if (!appState.servers.length) loadServers();
        if (!appState.friends.length) loadFriends();
    });
</script>

<aside class="sidebar-layout" class:mobile-open={uiState.mobileSidebarOpen}>
    <button
        class="mobile-close-btn"
        onclick={() => (uiState.mobileSidebarOpen = false)}
    >
        <Icon name="lucide:x" size="24" />
    </button>
    <nav class="server-rail">
        <ServerIcon
            name="Home"
            icon="lucide:message-square"
            active={!appState.activeServerId}
            onClick={() => selectSection("friends", "dm")}
        />
        <div class="rail-divider"></div>
        {#each appState.servers as server (server.id)}
            <ServerIcon
                name={server.name}
                active={appState.activeServerId === server.id}
                onClick={() => selectSection(server.id, "server")}
            />
        {/each}
        <ServerIcon
            name="Add Server"
            icon="lucide:plus"
            variant="green"
            onClick={() => (createServerOpen = true)}
        />
    </nav>
    <div class="channel-list">
        <div class="scroller">
            {#if !appState.activeServerId}
                <div class="sidebar-search-area">
                    <button class="search-box"
                        >Find or start a conversation</button
                    >
                </div>
                <ul class="nav-links">
                    <li class:active={appState.currentChat === "friends"}>
                        <button onclick={() => selectSection("friends", "dm")}>
                            <Icon name="lucide:users" size="20" />
                            Friends
                            {#if appState.requests.length > 0}
                                <span class="badge red"
                                    >{appState.requests.length}</span
                                >
                            {/if}
                        </button>
                    </li>
                    <li class:active={appState.currentChat === "saved"}>
                        <button onclick={() => selectSection("saved", "dm")}>
                            <Icon name="lucide:star" size="20" />
                            Saved Media
                        </button>
                    </li>
                    {#if appState.user?.role === "owner"}
                        <li class:active={appState.currentChat === "admin"}>
                            <button
                                onclick={() => selectSection("admin", "dm")}
                            >
                                <Icon name="lucide:shield-check" size="20" />
                                Admin Dashboard
                            </button>
                        </li>
                    {/if}
                </ul>
                <div class="section-divider">
                    <span>Direct Messages</span>
                    <button
                        class="add-btn"
                        title="Create Group DM"
                        onclick={() => (createGroupOpen = true)}
                    >
                        <Icon name="lucide:plus" size="14" />
                    </button>
                </div>
                <ul class="dms-list">
                    {#each appState.dms as dm}
                        {@const profile =
                            appState.profileCache[dm.username] || dm}
                        {@const isOnline = appState.onlineUsers.has(
                            dm.username,
                        )}
                        {@const status = isOnline
                            ? profile.custom_status || "online"
                            : "offline"}
                        <li class:active={appState.currentChat === dm.username}>
                            <div
                                class="chat-link"
                                role="button"
                                tabindex="0"
                                onclick={() => selectSection(dm.username, "dm")}
                                onkeydown={(e) =>
                                    (e.key === "Enter" || e.key === " ") &&
                                    selectSection(dm.username, "dm")}
                                aria-label="Chat with {profile.display_name ||
                                    dm.username}"
                            >
                                <div class="av-wrap">
                                    <Avatar
                                        src={profile.profile_picture ||
                                            profile.pfp}
                                        initials={(
                                            profile.display_name || dm.username
                                        ).charAt(0)}
                                        size="32px"
                                        {status}
                                        bgColor="transparent"
                                        dotBorder="var(--bg-secondary)"
                                    />
                                </div>
                                <span class="name font-{profile.display_name_font || 'normal'} {profile.is_enchanted ? 'enchanted-text' : ''}">
                                    {profile.display_name || dm.username}
                                    {#if profile.official}
                                        <img src="/enchatted/web_assets/official.gif" alt="Official" title="Official account of this person" class="inline-badge" style="width: 14px; height: 14px; margin-left: 4px;" />
                                    {/if}
                                </span>
                                {#if dm.unread > 0}
                                    <span class="badge red">{dm.unread}</span>
                                {/if}
                                {#if appState.isTyping[dm.username]}
                                    <div class="typing-pill">...</div>
                                {/if}
                                <button
                                    class="close-dm"
                                    onclick={(e) => closeDm(e, dm.username)}
                                    title="Close DM"
                                >
                                    <Icon name="lucide:x" size="14" />
                                </button>
                            </div>
                        </li>
                    {/each}
                    {#each appState.groups as group}
                        <li
                            class:active={appState.currentChat ===
                                `group:${group.id}`}
                        >
                            <div
                                class="chat-link"
                                role="button"
                                tabindex="0"
                                onclick={() =>
                                    selectSection(`group:${group.id}`, "dm")}
                                onkeydown={(e) =>
                                    (e.key === "Enter" || e.key === " ") &&
                                    selectSection(`group:${group.id}`, "dm")}
                                aria-label="Group chat: {group.name}"
                            >
                                <div class="av-wrap">
                                    <Icon name="lucide:users" size="24" />
                                </div>
                                <span class="name">{group.name}</span>
                                {#if (appState.unreadMessages[`group:${group.id}`] || 0) > 0}
                                    <span class="badge red"
                                        >{appState.unreadMessages[
                                            `group:${group.id}`
                                        ]}</span
                                    >
                                {/if}
                            </div>
                        </li>
                    {/each}
                </ul>
            {:else}
                <ServerChannelList
                    onCreateChannel={() => (createChannelOpen = true)}
                    onCreateGroup={() => (createServerGroupOpen = true)}
                    onServerSettings={() => (serverSettingsOpen = true)}
                />
            {/if}
        </div>
        <UserPanel onSettings={() => (settingsOpen = true)} />
    </div>
</aside>
<SettingsModal open={settingsOpen} onClose={() => (settingsOpen = false)} />
<CreateServerModal
    open={createServerOpen}
    onClose={() => (createServerOpen = false)}
    onCreated={handleServerCreated}
/>
<CreateChannelModal
    open={createChannelOpen}
    serverId={appState.activeServerId}
    onClose={() => (createChannelOpen = false)}
    onCreated={handleChannelCreated}
/>
<CreateGroupModal
    open={createGroupOpen}
    onClose={() => (createGroupOpen = false)}
    onCreated={handleGroupCreated}
/>
<CreateServerGroupModal
    bind:open={createServerGroupOpen}
    serverId={appState.activeServerId}
/>
<ServerSettingsModal
    bind:open={serverSettingsOpen}
    serverId={appState.activeServerId}
    onClose={() => (serverSettingsOpen = false)}
    onUpdated={handleServerCreated}
/>

<style>
    .sidebar-layout {
        display: flex;
        height: 100%;
        overflow: hidden;
    }
    .mobile-close-btn {
        display: none;
    }
    @media (max-width: 768px) {
        .sidebar-layout {
            position: fixed;
            left: 0;
            top: 0;
            bottom: 0;
            z-index: 1100;
            transform: translateX(-100%);
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            background: var(--bg-secondary);
            box-shadow: 4px 0 24px rgba(0, 0, 0, 0.5);
        }
        .sidebar-layout.mobile-open {
            transform: translateX(0);
        }
        .mobile-close-btn {
            display: flex;
            position: absolute;
            right: -48px;
            top: 12px;
            background: rgba(0, 0, 0, 0.4);
            color: white;
            border: none;
            border-radius: 50%;
            width: 36px;
            height: 36px;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            backdrop-filter: blur(4px);
        }
    }
    .server-rail {
        width: 72px;
        background-color: var(--bg-tertiary);
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 12px 0;
        gap: 8px;
        flex-shrink: 0;
    }
    .rail-divider {
        width: 32px;
        height: 2px;
        background-color: var(--border-color);
        margin: 4px 0;
        border-radius: 1px;
    }
    .channel-list {
        width: 240px;
        background-color: var(--bg-secondary);
        display: flex;
        flex-direction: column;
        flex-shrink: 0;
    }
    .scroller {
        flex: 1;
        overflow-y: auto;
    }
    .nav-links {
        padding: 12px 8px;
        list-style: none;
        margin: 0;
    }
    ul {
        list-style: none;
        padding: 0 8px;
        margin: 0;
    }
    li {
        margin-bottom: 2px;
    }
    li button,
    li .chat-link {
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
    .nav-links li button {
        padding: 10px 12px;
        font-size: 1rem;
        font-weight: 500;
    }
    li:hover button,
    li:hover .chat-link {
        background-color: rgba(255, 255, 255, 0.04);
        color: var(--text-primary);
    }
    li.active button,
    li.active .chat-link {
        background-color: rgba(255, 255, 255, 0.08);
        color: var(--text-primary);
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
    .sidebar-search-area {
        height: 48px;
        padding: 0 10px;
        display: flex;
        align-items: center;
        border-bottom: 1px solid var(--border-color);
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }
    .search-box {
        width: 100%;
        height: 28px;
        background: var(--bg-primary);
        border-radius: 4px;
        color: var(--text-muted);
        font-size: 0.85rem;
        text-align: left;
        padding: 0 8px;
        cursor: pointer;
    }
    .close-dm {
        opacity: 0;
        margin-left: auto;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        background: transparent;
        border: none;
        color: var(--text-muted);
        border-radius: 4px;
        flex-shrink: 0;
        cursor: pointer;
        transition:
            opacity 0.1s,
            color 0.1s,
            background 0.1s;
    }
    li:hover .close-dm {
        opacity: 1;
    }
    .close-dm:hover {
        background: var(--danger-color);
        color: white;
    }
    .badge {
        margin-left: 0;
    }
    li:not(:hover) .badge {
        margin-left: auto;
    }
    .typing-pill {
        font-size: 1.2rem;
        color: var(--accent-primary);
        font-weight: bold;
        line-height: 0;
        margin-bottom: 8px;
    }
</style>
