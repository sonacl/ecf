<script>
    import { onMount } from "svelte";
    import Sidebar from "$lib/components/layout/Sidebar.svelte";
    import FriendsPanel from "$lib/components/friends/FriendsPanel.svelte";
    import ChatHeader from "$lib/components/chat/ChatHeader.svelte";
    import MessageList from "$lib/components/chat/MessageList.svelte";
    import MessageComposer from "$lib/components/chat/MessageComposer.svelte";
    import EmptyState from "$lib/components/ui/EmptyState.svelte";
    import { api } from "$lib/utils/api.js";
    import { appState, uiState } from "$lib/state.svelte.js";
    import {
        loadInitialData,
        fetchMessages,
        sendMessage,
        scrollToBottom,
        startServices,
        getChannelInfo,
        markChatSeen,
    } from "$lib/utils/chat.js";
    import UserProfileModal from "$lib/components/profile/UserProfileModal.svelte";
    import ChatSidebar from "$lib/components/chat/ChatSidebar.svelte";
    import AdminDashboard from "$lib/components/admin/AdminDashboard.svelte";
    import SavedMediaPanel from "$lib/components/media/SavedMediaPanel.svelte";
    let chatContainer = $state(null);
    const isFriendsView = $derived(
        !appState.currentChat || appState.currentChat === "friends",
    );
    const isAdminView = $derived(appState.currentChat === "admin");
    const isSavedView = $derived(appState.currentChat === "saved");
    const activeChannel = $derived(
        isFriendsView ? null : getChannelInfo(appState.currentChat),
    );
    const showSidebar = $derived(
        uiState.sidebarOpen &&
            !isFriendsView &&
            !isAdminView &&
            !isSavedView &&
            appState.currentChat &&
            !appState.currentChat.startsWith("channel:"),
    );
    $effect(() => {
        if (
            appState.currentChat &&
            !["friends", "admin", "saved"].includes(appState.currentChat)
        ) {
            fetchMessages(appState.currentChat).then(() => {
                scrollToBottom(chatContainer);
            });
            markChatSeen(appState.currentChat);
        }
    });
    async function handleSend(content) {
        if (!appState.currentChat || appState.currentChat === "friends") return;
        const msg = await sendMessage(appState.currentChat, content);
        if (msg) {
            scrollToBottom(chatContainer);
        }
    }
    async function handleReact(mid, type) {
        if (!appState.currentChat) return;
        try {
            if (appState.currentChat.startsWith("channel:")) {
                const cid = appState.currentChat.split(":")[1];
                await api.servers.react(
                    appState.activeServerId,
                    cid,
                    mid,
                    type,
                );
            } else {
                await api.messages.react(mid, type);
            }
        } catch (e) {
            console.error("Failed to react:", e);
        }
    }
    async function handleEdit(mid, content) {
        if (!appState.currentChat) return;
        try {
            if (appState.currentChat.startsWith("channel:")) {
                const cid = appState.currentChat.split(":")[1];
                await api.servers.edit(
                    appState.activeServerId,
                    cid,
                    mid,
                    content,
                );
            } else {
                await api.messages.edit(mid, content);
            }
            appState.messages = appState.messages.map((m) =>
                m.id === mid ? { ...m, content: content + "\nEDITED" } : m,
            );
        } catch (e) {
            console.error("Failed to edit:", e);
            throw e;
        }
    }
    async function handleDelete(mid) {
        if (!appState.currentChat || !confirm("Delete this message?")) return;
        try {
            if (appState.currentChat.startsWith("channel:")) {
                const cid = appState.currentChat.split(":")[1];
                await api.servers.delete(appState.activeServerId, cid, mid);
            } else {
                await api.messages.delete(mid);
            }
            appState.messages = appState.messages.filter((m) => m.id !== mid);
        } catch (e) {
            console.error("Failed to delete:", e);
        }
    }
    onMount(() => {
        return startServices();
    });
</script>

<div class="app-layout">
    <Sidebar />
    {#if uiState.mobileSidebarOpen}
        <div
            class="mobile-backdrop"
            onclick={() => (uiState.mobileSidebarOpen = false)}
            onkeydown={(e) =>
                (e.key === "Enter" || e.key === " ") &&
                (uiState.mobileSidebarOpen = false)}
            role="button"
            tabindex="0"
            aria-label="Close menu"
        ></div>
    {/if}
    <main class="chat-main">
        {#if isFriendsView}
            <FriendsPanel />
        {:else if isAdminView}
            <AdminDashboard />
        {:else if isSavedView}
            <SavedMediaPanel />
        {:else if activeChannel}
            <ChatHeader
                channelName={activeChannel.name}
                isDM={activeChannel.isDM}
                subtitle={activeChannel.subtitle}
            />
            <div class="messages-area" bind:this={chatContainer}>
                <MessageList
                    messages={appState.messages}
                    onReply={(m) => console.log("Reply to", m)}
                    onReact={handleReact}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            </div>
            <MessageComposer
                onSend={handleSend}
                placeholder={`Message @${activeChannel.name}`}
            />
        {:else}
            <EmptyState
                title="Select a conversation"
                subtitle="Choose a friend from the sidebar to start chatting."
            />
        {/if}
    </main>
    {#if showSidebar}
        <ChatSidebar target={appState.currentChat} />
    {/if}
    <UserProfileModal
        username={uiState.viewingProfile}
        onClose={() => (uiState.viewingProfile = null)}
    />
</div>

<style>
    .app-layout {
        display: flex;
        height: 100vh;
        width: 100vw;
        background-color: var(--bg-primary);
        overflow: hidden;
    }
    .chat-main {
        flex: 1;
        display: flex;
        flex-direction: column;
        background-color: var(--bg-primary);
        min-width: 0;
    }
    .messages-area {
        flex: 1;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        scroll-behavior: smooth;
    }
    .messages-area :global(.message-list) {
        flex: 1;
    }
    .mobile-backdrop {
        display: none;
    }
    @media (max-width: 768px) {
        .mobile-backdrop {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.4);
            backdrop-filter: blur(2px);
            z-index: 1050;
        }
        .chat-main {
            min-width: 0;
            width: 100%;
        }
        :global(.chat-sidebar) {
            position: fixed;
            right: 0;
            top: 0;
            bottom: 0;
            z-index: 1200;
            width: 85% !important;
            max-width: 320px;
            box-shadow: -4px 0 24px rgba(0, 0, 0, 0.5);
        }
    }
</style>
