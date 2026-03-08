<script>
    import { onMount } from "svelte";
    import Icon from "./Icon.svelte";
    import { api } from "$lib/utils/api.js";
    let { onSelect, onClose } = $props();
    let query = $state("");
    let gifs = $state([]);
    let loading = $state(true);
    let searchTimeout = null;
    async function fetchTrending() {
        loading = true;
        try {
            const res = await api.gifs.trending();
            gifs = Array.isArray(res) ? res : res.gifs || [];
        } catch (e) {
            console.error("Failed to fetch trending GIFs", e);
        } finally {
            loading = false;
        }
    }
    async function fetchSearch(q) {
        if (!q.trim()) {
            fetchTrending();
            return;
        }
        loading = true;
        try {
            const res = await api.gifs.search(q);
            gifs = Array.isArray(res) ? res : res.gifs || [];
        } catch (e) {
            console.error("Failed to search GIFs", e);
        } finally {
            loading = false;
        }
    }
    function handleSearchInput() {
        if (searchTimeout) clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => fetchSearch(query), 500);
    }
    onMount(() => {
        fetchTrending();
    });
</script>
<div class="gif-picker-overlay" onclick={onClose}>
    <div class="gif-picker-content" onclick={(e) => e.stopPropagation()}>
        <div class="picker-header">
            <div class="search-box">
                <Icon name="lucide:search" size="16" />
                <input
                    type="text"
                    bind:value={query}
                    oninput={handleSearchInput}
                    placeholder="Search Tenor"
                    autocomplete="off"
                />
            </div>
        </div>
        <div class="gifs-grid" class:loading>
            {#if loading}
                <div class="spinner">
                    <Icon name="lucide:loader-circle" size="32" class="spin" />
                </div>
            {:else if gifs.length === 0}
                <div class="no-results">No GIFs found</div>
            {:else}
                {#each gifs as gif}
                    <button
                        class="gif-item"
                        onclick={() =>
                            onSelect(
                                gif.url || gif.media_formats?.gif?.url || gif,
                            )}
                    >
                        <img
                            src={gif.url || gif.media_formats?.gif?.url || gif}
                            alt="GIF"
                            loading="lazy"
                        />
                    </button>
                {/each}
            {/if}
        </div>
    </div>
</div>
<style>
    .gif-picker-overlay {
        position: fixed;
        inset: 0;
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.4);
    }
    .gif-picker-content {
        width: 380px;
        height: 480px;
        max-width: 90vw;
        max-height: 80vh;
        background: var(--bg-primary);
        border-radius: 8px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }
    .picker-header {
        padding: 12px;
        background: var(--bg-secondary);
        border-bottom: 1px solid var(--border-color);
    }
    .search-box {
        display: flex;
        align-items: center;
        gap: 8px;
        background: var(--bg-tertiary);
        padding: 8px 12px;
        border-radius: 6px;
        color: var(--text-muted);
    }
    .search-box input {
        flex: 1;
        background: transparent;
        border: none;
        color: var(--text-primary);
        font-size: 0.95rem;
        outline: none;
    }
    .gifs-grid {
        flex: 1;
        overflow-y: auto;
        padding: 8px;
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
        align-content: start;
    }
    .gifs-grid.loading {
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .spinner {
        color: var(--accent-primary);
        animation: spin 1s linear infinite;
    }
    @keyframes spin {
        100% {
            transform: rotate(360deg);
        }
    }
    .no-results {
        color: var(--text-muted);
        text-align: center;
        width: 100%;
        padding: 32px 0;
        grid-column: 1 / -1;
    }
    .gif-item {
        background: var(--bg-secondary);
        border: none;
        padding: 0;
        cursor: pointer;
        border-radius: 4px;
        overflow: hidden;
        aspect-ratio: 16/9;
        display: block;
        width: 100%;
    }
    .gif-item img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        transition: transform 0.2s;
    }
    .gif-item:hover img {
        transform: scale(1.05);
    }
</style>
