<script>
    import Icon from "../ui/Icon.svelte";
    import GifPicker from "../ui/GifPicker.svelte";
    import { uiState } from "$lib/stores/index.svelte.js";
    import { api } from "$lib/utils/api.js";
    let { onSend, placeholder = "Message..." } = $props();
    let content = $state("");
    let fileInput = $state(null);
    let gifPickerOpen = $state(false);
    const charCount = $derived(content.length);
    let typingTimeout;
    async function handleKeyDown(e) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submit();
            return;
        }
        if (!typingTimeout) {
            try {
                const target = uiState.currentChat;
                if (
                    appState.currentChat &&
                    !appState.currentChat.startsWith("channel:")
                ) {
                    api.messages
                        .sendTyping(appState.currentChat)
                        .catch(() => {});
                }
            } catch (e) {}
        }
        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => {
            typingTimeout = null;
        }, 3000);
    }
    function submit() {
        if (uiState.isSending) return;
        if (!content.trim() && !uiState.pendingFileUrl) return;
        let finalContent = content.trim();
        if (uiState.pendingReply) {
            const replyPreview = btoa(
                unescape(
                    encodeURIComponent(
                        uiState.pendingReply.content.slice(0, 50),
                    ),
                ),
            );
            finalContent = `REPLY ${uiState.pendingReply.sender} ${uiState.pendingReply.id} ${replyPreview} RESPONSE ${finalContent}`;
        }
        if (uiState.pendingFileUrl) {
            finalContent += `\n${uiState.pendingFileUrl}`;
        }
        onSend(finalContent);
        content = "";
        uiState.pendingReply = null;
        uiState.editingMessage = null;
        uiState.pendingFileUrl = null;
    }
    function clearReply() {
        uiState.pendingReply = null;
    }
    function insertGif(url) {
        content = content ? `${content}\n${url}` : url;
        gifPickerOpen = false;
        submit();
    }
    async function handleFileUpload(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        uiState.isUploading = true;
        try {
            const formData = new FormData();
            formData.append("file", file);
            const res = await api.upload(formData);
            if (res && res.url) {
                uiState.pendingFileUrl = res.url;
            }
        } catch (err) {
            console.error("Upload failed", err);
        } finally {
            uiState.isUploading = false;
            e.target.value = "";
        }
    }
</script>
<div class="composer">
    {#if uiState.pendingReply}
        <div class="reply-preview">
            <span class="preview-text"
                >Replying to <strong>@{uiState.pendingReply.sender}</strong>: {uiState.pendingReply.content.slice(
                    0,
                    40,
                )}...</span
            >
            <button class="close-btn" onclick={clearReply}
                ><Icon name="lucide:x" size="14" /></button
            >
        </div>
    {/if}
    {#if uiState.pendingFileUrl}
        <div class="file-preview">
            <span class="file-name"
                ><Icon name="lucide:paperclip" size="14" />
                {uiState.pendingFileUrl.split("/").pop()}</span
            >
            <button
                class="close-btn"
                onclick={() => (uiState.pendingFileUrl = null)}
                ><Icon name="lucide:x" size="14" /></button
            >
        </div>
    {/if}
    <div class="composer-main">
        <div class="input-wrapper">
            <button
                class="action-btn attach-btn"
                title="Upload File"
                onclick={() => fileInput?.click()}
                disabled={uiState.isUploading}
            >
                {#if uiState.isUploading}
                    <Icon name="lucide:loader-circle" size="22" class="spin" />
                {:else}
                    <Icon name="lucide:plus-circle" size="22" />
                {/if}
            </button>
            <input
                type="file"
                bind:this={fileInput}
                onchange={handleFileUpload}
                hidden
            />
            <textarea
                bind:value={content}
                onkeydown={handleKeyDown}
                {placeholder}
                rows="1"
                class="message-textarea"
            ></textarea>
        </div>
        <div class="composer-actions">
            <div class="char-count" class:limit={charCount > 9000}>
                {charCount}/10000
            </div>
            <button
                class="action-btn"
                title="GIFs"
                onclick={() => (gifPickerOpen = true)}
            >
                <Icon name="lucide:image" size="20" />
            </button>
            <button class="action-btn" title="Stickers">
                <Icon name="lucide:sticky-note" size="20" />
            </button>
            <button class="action-btn" title="Emoji">
                <Icon name="lucide:smile" size="20" />
            </button>
            <button
                class="action-btn send-mobile"
                title="Send"
                onclick={submit}
            >
                <Icon name="lucide:send" size="20" />
            </button>
        </div>
    </div>
</div>
{#if gifPickerOpen}
    <GifPicker onSelect={insertGif} onClose={() => (gifPickerOpen = false)} />
{/if}
<style>
    .composer {
        padding: 0 12px 10px 12px;
        background-color: var(--bg-primary);
    }
    .composer-main {
        background-color: var(--bg-secondary);
        border-radius: 6px;
        display: flex;
        align-items: center;
        padding: 0 4px;
        min-height: 36px;
    }
    .input-wrapper {
        flex: 1;
        display: flex;
        align-items: center;
        padding: 0;
    }
    .message-textarea {
        flex: 1;
        background: transparent;
        border: none;
        color: var(--text-primary);
        padding: 6px 0;
        margin: 0 6px;
        resize: none;
        outline: none;
        font-family: inherit;
        font-size: 0.9rem;
        max-height: 120px;
        line-height: 1.4;
    }
    .char-count {
        font-size: 0.7rem;
        color: var(--text-muted);
        white-space: nowrap;
        opacity: 0.6;
    }
    .char-count.limit {
        color: var(--danger-color);
        opacity: 1;
    }
    .composer-actions {
        display: flex;
        align-items: center;
        gap: 0px;
        flex-shrink: 0;
    }
    .action-btn {
        background: transparent;
        border: none;
        color: var(--text-muted);
        padding: 6px;
        cursor: pointer;
        border-radius: 4px;
        display: flex;
        align-items: center;
        transition: all 0.1s;
    }
    .action-btn:hover {
        color: var(--text-primary);
        background: rgba(255, 255, 255, 0.05);
    }
    .attach-btn {
        color: var(--text-muted);
    }
    .reply-preview,
    .file-preview {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: rgba(255, 255, 255, 0.03);
        padding: 6px 12px;
        border-top-left-radius: 8px;
        border-top-right-radius: 8px;
        border-bottom: 1px solid var(--border-color);
        font-size: 0.8rem;
        color: var(--text-muted);
    }
    .preview-text strong {
        color: var(--accent-primary);
    }
    .close-btn {
        background: transparent;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        padding: 2px;
        border-radius: 50%;
        display: flex;
    }
    .close-btn:hover {
        color: var(--text-primary);
        background: rgba(255, 255, 255, 0.1);
    }
    .file-name {
        display: flex;
        align-items: center;
        gap: 6px;
        color: var(--accent-primary);
    }
    .send-mobile {
        display: none;
        color: var(--accent-primary);
    }
    @media (max-width: 600px) {
        .composer {
            padding: 0 8px 8px 8px;
        }
        .char-count {
            display: none;
        }
        .send-mobile {
            display: flex;
        }
        .action-btn {
            padding: 4px;
        }
    }
</style>
