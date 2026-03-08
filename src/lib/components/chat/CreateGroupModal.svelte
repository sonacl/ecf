<script>
    import Icon from "../ui/Icon.svelte";
    import Button from "../ui/Button.svelte";
    import Avatar from "../ui/Avatar.svelte";
    import Input from "../ui/Input.svelte";
    import Modal from "../ui/Modal.svelte";
    import { api } from "$lib/utils/api.js";
    import { appState } from "$lib/state.svelte.js";
    let { open = false, onClose, onCreated, preselectedUser = null } = $props();
    let groupName = $state("");
    let selectedFriends = $state(new Set());
    let searchTerm = $state("");
    let loading = $state(false);
    let errorMsg = $state("");
    $effect(() => {
        if (
            open &&
            preselectedUser &&
            appState.friends.includes(preselectedUser)
        ) {
            selectedFriends = new Set([preselectedUser]);
        }
    });
    const filteredFriends = $derived(
        appState.friends.filter(
            (f) =>
                f.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (appState.profileCache[f]?.display_name || "")
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()),
        ),
    );
    function toggleFriend(username) {
        if (selectedFriends.has(username)) {
            selectedFriends.delete(username);
            errorMsg = "";
        } else {
            if (selectedFriends.size >= 10) {
                errorMsg = "You can add up to 10 friends to a group.";
                return;
            }
            selectedFriends.add(username);
            errorMsg = "";
        }
        selectedFriends = new Set(selectedFriends);
    }
    async function handleCreate(e) {
        e.preventDefault();
        errorMsg = "";
        if (selectedFriends.size === 0) {
            errorMsg = "Select at least one friend.";
            return;
        }
        loading = true;
        try {
            const res = await api.groups.create(
                Array.from(selectedFriends),
                groupName.trim() || null,
            );
            if (res) {
                groupName = "";
                selectedFriends = new Set();
                onCreated?.(res);
                onClose?.();
            }
        } catch (err) {
            errorMsg = err.message || "Failed to create group.";
        } finally {
            loading = false;
        }
    }
</script>
<Modal
    {open}
    title="Create Group DM"
    subtitle="Select friends to start a group conversation."
    {onClose}
>
    {#if errorMsg}
        <div class="error-banner">
            <Icon name="lucide:alert-circle" size="14" />
            {errorMsg}
        </div>
    {/if}
    <form onsubmit={handleCreate}>
        <Input
            id="cg-name"
            label="Group Name (optional)"
            bind:value={groupName}
            placeholder="My Cool Group"
        />
        <div class="friends-selection">
            <div class="search-wrap">
                <Icon name="lucide:search" size="16" class="search-icon" />
                <input
                    type="text"
                    bind:value={searchTerm}
                    placeholder="Find friends"
                />
            </div>
            <div class="friends-list scroller">
                {#each filteredFriends as friend}
                    <label
                        class="friend-item"
                        class:selected={selectedFriends.has(friend)}
                    >
                        <Avatar
                            src={appState.profileCache[friend]?.profile_picture}
                            initials={friend.charAt(0)}
                            size="32px"
                        />
                        <span class="name">
                            {appState.profileCache[friend]?.display_name ||
                                friend}
                        </span>
                        <input
                            type="checkbox"
                            checked={selectedFriends.has(friend)}
                            onchange={() => toggleFriend(friend)}
                        />
                        <div class="checkbox-ui">
                            {#if selectedFriends.has(friend)}
                                <Icon name="lucide:check" size="14" />
                            {/if}
                        </div>
                    </label>
                {:else}
                    <div class="empty-list">No friends found.</div>
                {/each}
            </div>
        </div>
        <div class="modal-footer">
            <div class="selection-count">
                {selectedFriends.size} friend{selectedFriends.size !== 1
                    ? "s"
                    : ""} selected
            </div>
            <Button
                type="submit"
                variant="primary"
                disabled={loading || selectedFriends.size === 0}
            >
                {loading ? "Creating..." : "Create Group"}
            </Button>
        </div>
    </form>
</Modal>
<style>
    .error-banner {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 14px;
        background: rgba(240, 71, 71, 0.1);
        border: 1px solid rgba(240, 71, 71, 0.2);
        border-radius: 8px;
        color: var(--danger-color);
        font-size: 0.85rem;
        margin-bottom: 16px;
    }
    .friends-selection {
        background: var(--bg-secondary);
        border-radius: 8px;
        border: 1px solid var(--border-color);
        overflow: hidden;
        display: flex;
        flex-direction: column;
    }
    .search-wrap {
        position: relative;
        padding: 8px;
        border-bottom: 1px solid var(--border-color);
    }
    .search-wrap :global(.search-icon) {
        position: absolute;
        left: 16px;
        top: 50%;
        transform: translateY(-50%);
        color: var(--text-muted);
    }
    .search-wrap input {
        width: 100%;
        background: var(--bg-primary);
        border: none;
        border-radius: 4px;
        padding: 6px 10px 6px 32px;
        color: var(--text-primary);
        font-size: 0.85rem;
    }
    .friends-list {
        max-height: 200px;
        overflow-y: auto;
        padding: 4px;
    }
    .friend-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px 12px;
        border-radius: 4px;
        cursor: pointer;
        transition: background 0.1s;
    }
    .friend-item:hover {
        background: var(--bg-modifier-hover);
    }
    .friend-item.selected {
        background: var(--bg-modifier-selected);
    }
    .friend-item .name {
        flex: 1;
        font-size: 0.95rem;
        color: var(--text-primary);
    }
    .friend-item input {
        display: none;
    }
    .checkbox-ui {
        width: 18px;
        height: 18px;
        border: 1px solid var(--text-muted);
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
    }
    .selected .checkbox-ui {
        background: var(--accent-primary);
        border-color: var(--accent-primary);
    }
    .empty-list {
        padding: 20px;
        text-align: center;
        color: var(--text-muted);
        font-size: 0.85rem;
    }
    .modal-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 24px;
    }
    .selection-count {
        font-size: 0.85rem;
        color: var(--text-muted);
    }
    .scroller::-webkit-scrollbar {
        width: 8px;
    }
    .scroller::-webkit-scrollbar-track {
        background: transparent;
    }
    .scroller::-webkit-scrollbar-thumb {
        background: var(--bg-tertiary);
        border-radius: 4px;
    }
</style>
