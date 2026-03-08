<script>
    import {
        formatTime,
        parseMessageContent,
        getEmbeds,
        getMediaType,
    } from "../../utils/ui.js";
    import Avatar from "../ui/Avatar.svelte";
    import Badge from "../ui/Badge.svelte";
    import Icon from "../ui/Icon.svelte";
    import { appState, uiState } from "$lib/state.svelte.js";
    import { api } from "$lib/utils/api.js";
    import { toastError, toastSuccess } from "$lib/utils/toast.svelte.js";
    let {
        id,
        author,
        content,
        timestamp,
        isGrouped = false,
        reactions = {},
        onReply,
        onReact,
        onDelete,
        onEdit,
        pending = false,
    } = $props();
    const parsed = $derived(parseMessageContent(content));
    const text = $derived(parsed.text);
    const reply = $derived(parsed.reply);
    const embeds = $derived(getEmbeds(text));
    const msgReactions = $derived(
        appState.messageReactions[id] || reactions || {},
    );
    const profile = $derived(
        appState.profileCache[author?.username] ||
            (author?.username === appState.username && appState.user
                ? appState.user
                : null),
    );
    const displayName = $derived(
        profile?.display_name || author?.display_name || author?.username,
    );
    const profilePicture = $derived(
        profile?.profile_picture || author?.profile_picture,
    );
    const isOfficial = $derived(profile?.official || author?.official);
    const isOwner = $derived(profile?.owner || author?.owner);
    const isEnchanted = $derived(profile?.is_enchanted);
    const displayNameFont = $derived(profile?.display_name_font || "default");
    function handleAction(type) {
        if (type === "reply" && author)
            uiState.pendingReply = {
                id,
                author: displayName,
                sender: author.username,
                content: text,
            };
        if (type === "edit") {
            isEditing = true;
            editContent = text;
        }
        if (type === "delete") onDelete?.(id);
        if (type === "save") handleSave();
    }
    let isEditing = $state(false);
    let editContent = $state("");
    async function submitEdit() {
        if (!editContent.trim()) return;
        try {
            await onEdit?.(id, editContent);
            isEditing = false;
        } catch (e) {
            toastError("Failed to edit", e.message);
        }
    }
    function cancelEdit() {
        isEditing = false;
    }
    function handleEditKey(e) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submitEdit();
        }
        if (e.key === "Escape") {
            cancelEdit();
        }
    }
    async function handleSave() {
        const urls = [...embeds];
        if (!urls.length) {
            toastError("Nothing to save", "This message has no media/links.");
            return;
        }
        try {
            for (const url of urls) {
                await api.media.save(url);
            }
            toastSuccess(
                "Saved!",
                `${urls.length} item(s) added to your saved media.`,
            );
        } catch (e) {
            toastError("Failed to save", e.message);
        }
    }
    function jumpToMessage(msgId) {
        if (!msgId) return;
        const target = document.querySelector(`[data-id="${msgId}"]`);
        if (target) {
            target.scrollIntoView({ behavior: "smooth", block: "center" });
            target.classList.add("highlight");
            setTimeout(() => target.classList.remove("highlight"), 2000);
        } else {
            console.warn("Message not found globally:", msgId);
        }
    }
</script>

<div
    class="message-wrapper {isGrouped ? 'grouped' : ''} {pending
        ? 'pending'
        : ''} {text?.includes('@' + appState.username) ? 'mention' : ''}"
    data-id={id}
>
    {#if !isGrouped && author}
        <button
            class="avatar-col"
            onclick={() => (uiState.viewingProfile = author.username)}
            aria-label="View {displayName}'s profile"
        >
            <Avatar
                src={profilePicture}
                initials={displayName?.charAt(0)}
                size="40px"
                status="online"
                {isEnchanted}
                decoration={profile?.avatar_decoration}
            />
        </button>
    {:else}
        <div class="grouped-time">
            {formatTime(timestamp)}
        </div>
    {/if}
    <div class="content-col">
        {#if !isGrouped && author}
            <div class="msg-header">
                <button
                    class="author-name font-{displayNameFont} {isEnchanted ? 'enchanted-text' : ''}"
                    onclick={() => (uiState.viewingProfile = author.username)}
                >
                    {displayName}
                </button>
                {#if isOfficial}
                    <Badge type="official" />
                {/if}
                {#if isOwner}
                    <Badge type="owner" />
                {/if}
                <span class="timestamp">{formatTime(timestamp)}</span>
            </div>
        {/if}
        {#if reply}
            <button
                class="reply-block"
                onclick={() => jumpToMessage(reply.id)}
                aria-label="Jump to reply from {reply.sender}"
            >
                <div class="reply-line"></div>
                <span class="reply-icon">
                    <Icon name="lucide:corner-up-right" size="14" />
                </span>
                <span class="reply-author">@{reply.sender}</span>
                <span class="reply-preview">{reply.preview}</span>
            </button>
        {/if}
        {#if isEditing}
            <div class="edit-container">
                <textarea
                    bind:value={editContent}
                    onkeydown={handleEditKey}
                    rows="2"
                    class="edit-textarea"
                ></textarea>
                <div class="edit-help">
                    escape to <span>cancel</span> • enter to <span>save</span>
                </div>
            </div>
        {:else}
            <div class="msg-text">
                {text}
                {#if content.endsWith("\nEDITED")}
                    <span class="edited-badge">(edited)</span>
                {/if}
            </div>
        {/if}
        {#if embeds.length > 0}
            <div class="embeds-container">
                {#each embeds as url}
                    {@const type = getMediaType(url)}
                    <div class="embed-item {type}">
                        {#if type === "image"}
                            <img src={url} alt="Shared" loading="lazy" />
                        {:else if type === "video"}
                            <video src={url} controls preload="metadata">
                                <track kind="captions" />
                            </video>
                        {:else}
                            <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer">{url}</a
                            >
                        {/if}
                    </div>
                {/each}
            </div>
        {/if}
        {#if Object.keys(msgReactions).length > 0}
            <div class="reactions-list">
                {#each Object.entries(msgReactions) as [type, users]}
                    {@const userList = Array.isArray(users) ? users : []}
                    <button
                        class="reaction-pill {userList.includes(
                            appState.username,
                        )
                            ? 'active'
                            : ''}"
                        onclick={() => onReact?.(id, type)}
                        title={userList.join(", ")}
                    >
                        <span class="emoji"
                            >{type === "heart" ? "❤️" : type}</span
                        >
                        <span class="count">{userList.length}</span>
                    </button>
                {/each}
            </div>
        {/if}
    </div>
    <div class="msg-actions">
        <button onclick={() => handleAction("reply")} title="Reply"
            ><Icon name="lucide:reply" size="14" /></button
        >
        <button onclick={() => onReact?.(id, "heart")} title="Heart"
            ><Icon name="lucide:heart" size="14" /></button
        >
        {#if embeds.length > 0}
            <button onclick={() => handleAction("save")} title="Save Media"
                ><Icon name="lucide:star" size="14" /></button
            >
        {/if}
        {#if author?.username === appState.username}
            <button onclick={() => handleAction("edit")} title="Edit"
                ><Icon name="lucide:pencil" size="14" /></button
            >
            <button
                onclick={() => handleAction("delete")}
                title="Delete"
                class="danger"><Icon name="lucide:trash-2" size="14" /></button
            >
        {/if}
    </div>
</div>

<style>
    .message-wrapper {
        display: flex;
        gap: 16px;
        padding: 4px 16px;
        position: relative;
        transition: background-color 0.1s;
    }
    .message-wrapper:hover {
        background-color: rgba(255, 255, 255, 0.02);
    }
    .message-wrapper.mention {
        background-color: rgba(125, 5, 135, 0.05);
        border-left: 2px solid var(--accent-primary);
    }
    .message-wrapper.highlight {
        animation: highlight-fade 2s ease-in-out;
    }
    @keyframes highlight-fade {
        0% {
            background-color: rgba(255, 255, 255, 0.1);
        }
        100% {
            background-color: transparent;
        }
    }
    .message-wrapper.pending {
        opacity: 0.5;
        filter: grayscale(0.5);
    }
    .message-wrapper.grouped {
        padding-top: 1px;
        padding-bottom: 1px;
    }
    .avatar-col {
        padding-top: 4px;
        cursor: pointer;
    }
    .content-col {
        flex: 1;
        min-width: 0;
    }
    .msg-header {
        display: flex;
        align-items: baseline;
        gap: 8px;
        margin-bottom: 4px;
    }
    .author-name {
        font-weight: 600;
        color: var(--text-primary);
        font-size: 0.95rem;
        cursor: pointer;
    }
    .author-name:hover {
        text-decoration: underline;
    }
    .author-name.font-serif {
        font-family: serif;
    }
    .author-name.font-mono {
        font-family: monospace;
    }
    .author-name.font-cursive {
        font-family: cursive;
    }
    .author-name.font-bold {
        font-weight: 800;
    }
    .author-name.font-italic {
        font-style: italic;
    }
    .timestamp {
        font-size: 0.75rem;
        color: var(--text-muted);
    }
    .msg-text {
        color: var(--text-secondary);
        line-height: 1.4;
        white-space: pre-wrap;
        word-break: break-word;
        font-size: 0.95rem;
    }
    .edited-badge {
        font-size: 0.7rem;
        color: var(--text-muted);
        margin-left: 4px;
    }
    .edit-container {
        margin-top: 4px;
        width: 100%;
    }
    .edit-textarea {
        width: 100%;
        background: var(--bg-tertiary);
        border: none;
        border-radius: 8px;
        color: var(--text-primary);
        padding: 10px;
        font-family: inherit;
        font-size: 0.95rem;
        resize: none;
        outline: none;
        box-shadow: 0 0 0 2px var(--accent-primary);
    }
    .edit-help {
        font-size: 0.7rem;
        color: var(--text-muted);
        margin-top: 4px;
        padding-left: 2px;
    }
    .edit-help span {
        color: var(--accent-primary);
        cursor: pointer;
    }
    .edit-help span:hover {
        text-decoration: underline;
    }
    .reply-block {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 4px;
        padding: 4px 8px;
        font-size: 0.8rem;
        color: var(--text-muted);
        background: rgba(255, 255, 255, 0.03);
        border-radius: 4px;
        position: relative;
        cursor: pointer;
        transition: background 0.2s;
        max-width: 90%;
        margin-left: -8px;
    }
    .reply-block:hover {
        background: rgba(255, 255, 255, 0.06);
        color: var(--text-primary);
    }
    .reply-line {
        position: absolute;
        left: -12px;
        top: -6px;
        bottom: 50%;
        width: 14px;
        border-left: 2px solid var(--border-color);
        border-top: 2px solid var(--border-color);
        border-top-left-radius: 4px;
        opacity: 0.5;
    }
    .reply-icon {
        color: var(--text-muted);
        display: flex;
        align-items: center;
    }
    .reply-author {
        font-weight: 700;
        color: var(--accent-primary);
        white-space: nowrap;
    }
    .reply-preview {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        opacity: 0.8;
    }
    .embeds-container {
        margin-top: 8px;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    .embed-item img,
    .embed-item video {
        max-width: 400px;
        max-height: 300px;
        border-radius: 8px;
        border: 1px solid var(--border-color);
    }
    @media (max-width: 600px) {
        .embed-item img,
        .embed-item video {
            max-width: 100%;
            max-height: 400px;
        }
    }
    .reactions-list {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        margin-top: 6px;
    }
    .reaction-pill {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 2px 6px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid transparent;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.1s;
    }
    .reaction-pill:hover {
        background: rgba(255, 255, 255, 0.1);
        border-color: rgba(255, 255, 255, 0.2);
    }
    .reaction-pill.active {
        background: rgba(125, 5, 135, 0.15);
        border-color: rgba(125, 5, 135, 0.3);
    }
    .reaction-pill.active .count {
        color: var(--accent-primary);
    }
    .reaction-pill .count {
        font-size: 0.8rem;
        font-weight: 600;
        color: var(--text-muted);
    }
    .msg-actions {
        position: absolute;
        right: 16px;
        top: -12px;
        display: none;
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        border-radius: 4px;
        padding: 2px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        z-index: 10;
    }
    .message-wrapper:hover .msg-actions {
        display: flex;
    }
    .msg-actions button {
        background: transparent;
        border: none;
        color: var(--text-muted);
        padding: 4px 6px;
        cursor: pointer;
        border-radius: 3px;
        display: flex;
        align-items: center;
    }
    .msg-actions button:hover {
        background: rgba(255, 255, 255, 0.05);
        color: var(--text-primary);
    }
    .msg-actions button.danger:hover {
        color: var(--danger-color);
    }
    .grouped-time {
        width: 40px;
        text-align: right;
        font-size: 0.65rem;
        color: var(--text-muted);
        opacity: 0;
        padding-top: 6px;
        flex-shrink: 0;
        user-select: none;
    }
    .message-wrapper:hover .grouped-time {
        opacity: 1;
    }
    @media (max-width: 600px) {
        .message-wrapper {
            gap: 10px;
            padding: 4px 10px;
        }
        .avatar-col {
            padding-top: 2px;
        }
        :global(.avatar-col .avatar-container) {
            width: 32px !important;
            height: 32px !important;
        }
        .msg-actions {
            display: flex;
            opacity: 0.8;
            top: 2px;
            right: 8px;
            background: rgba(var(--bg-secondary-rgb, 40, 40, 40), 0.9);
            box-shadow: none;
            border-radius: 12px;
            padding: 1px 4px;
        }
        .msg-actions button {
            padding: 3px;
        }
        .msg-header {
            gap: 4px;
        }
        .author-name {
            font-size: 0.9rem;
        }
        .msg-text {
            font-size: 0.9rem;
        }
    }
</style>
