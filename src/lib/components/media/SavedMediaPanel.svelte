<script>
    import { onMount } from "svelte";
    import Icon from "../ui/Icon.svelte";
    import Button from "../ui/Button.svelte";
    import { api } from "$lib/utils/api.js";
    import { appState } from "$lib/state.svelte.js";
    import { toastError } from "$lib/utils/toast.svelte.js";
    let loading = $state(true);
    async function loadMedia() {
        loading = true;
        try {
            const res = await api.media.getSaved();
            appState.savedMedia = Array.isArray(res) ? res : [];
        } catch (e) {
            toastError("Failed to load saved media", e.message);
        } finally {
            loading = false;
        }
    }
    async function removeItem(url) {
        try {
            await api.media.removeSaved(url);
            appState.savedMedia = appState.savedMedia.filter(
                (i) => i.url !== url,
            );
        } catch (e) {
            toastError("Failed to remove", e.message);
        }
    }
    onMount(() => {
        loadMedia();
    });
</script>
<div class="saved-panel">
    <div class="header">
        <Icon name="lucide:star" size="20" />
        <h2>Saved Media</h2>
    </div>
    {#if loading}
        <div class="loading">
            <Icon name="lucide:loader-circle" size="24" class="spin" />
            <p>Loading your treasures...</p>
        </div>
    {:else if appState.savedMedia.length === 0}
        <div class="empty">
            <Icon name="lucide:star" size="48" style="opacity: 0.2" />
            <p>You haven't saved any media yet.</p>
            <p class="sub">
                Click the star icon on messages to save important links or
                media.
            </p>
        </div>
    {:else}
        <div class="grid">
            {#each appState.savedMedia as item}
                <div class="media-card">
                    {#if item.url?.match(/\.(jpg|jpeg|png|gif|webp)$/i)}
                        <img src={item.url} alt="Saved Media" />
                    {:else}
                        <div class="file-box">
                            <Icon name="lucide:file" size="32" />
                            <span class="file-name"
                                >{item.url?.split("/").pop() || "File"}</span
                            >
                        </div>
                    {/if}
                    <div class="card-overlay">
                        <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            class="action-btn"
                            title="Open Original"
                        >
                            <Icon name="lucide:external-link" size="18" />
                        </a>
                        <Button
                            variant="danger"
                            size="sm"
                            onclick={() => removeItem(item.url)}
                        >
                            <Icon name="lucide:trash-2" size="14" />
                        </Button>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>
<style>
    .saved-panel {
        height: 100%;
        display: flex;
        flex-direction: column;
        background: var(--bg-primary);
    }
    .header {
        padding: 14px 20px;
        border-bottom: 1px solid var(--border-color);
        display: flex;
        align-items: center;
        gap: 12px;
        color: var(--text-primary);
    }
    .header h2 {
        font-size: 1rem;
        font-weight: 700;
    }
    .loading,
    .empty {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 16px;
        color: var(--text-muted);
    }
    .empty .sub {
        font-size: 0.85rem;
        opacity: 0.7;
    }
    .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 16px;
        padding: 20px;
        overflow-y: auto;
    }
    .media-card {
        aspect-ratio: 16/10;
        background: var(--bg-secondary);
        border-radius: 8px;
        overflow: hidden;
        position: relative;
        border: 1px solid var(--border-color);
        transition: transform 0.2s;
    }
    .media-card:hover {
        transform: translateY(-2px);
    }
    .media-card img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    .file-box {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
        color: var(--text-muted);
    }
    .file-name {
        font-size: 0.8rem;
        max-width: 90%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .card-overlay {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        opacity: 0;
        transition: opacity 0.2s;
    }
    .media-card:hover .card-overlay {
        opacity: 1;
    }
    .action-btn {
        width: 36px;
        height: 36px;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        color: white;
    }
    .action-btn:hover {
        background: rgba(255, 255, 255, 0.2);
    }
    :global(.spin) {
        animation: spin 1s linear infinite;
    }
    @keyframes spin {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }
</style>
