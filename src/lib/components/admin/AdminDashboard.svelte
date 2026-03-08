<script>
    import { onMount } from "svelte";
    import Icon from "../ui/Icon.svelte";
    import Button from "../ui/Button.svelte";
    import Avatar from "../ui/Avatar.svelte";
    import Input from "../ui/Input.svelte";
    import { api } from "$lib/utils/api.js";
    import { appState } from "$lib/state.svelte.js";
    import { toastError, toastSuccess } from "$lib/utils/toast.svelte.js";
    let users = $state([]);
    let loading = $state(true);
    let searchTerm = $state("");
    async function loadUsers() {
        loading = true;
        try {
            const res = await api.admin.listUsers();
            users = Array.isArray(res)
                ? res
                : Array.isArray(res?.users)
                  ? res.users
                  : [];
        } catch (e) {
            toastError("Admin Error", "Failed to fetch users list.");
        } finally {
            loading = false;
        }
    }
    const filteredUsers = $derived(
        users.filter(
            (u) =>
                u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.display_name
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase()),
        ),
    );
    async function toggleEnchant(user) {
        try {
            const next = !user.is_enchanted;
            await api.admin.enchant(user.username, next, user.level || 1);
            user.is_enchanted = next;
            toastSuccess(
                next ? "Enchanted!" : "Banished enchant",
                `@${user.username}`,
            );
        } catch (e) {
            toastError("Failed", e.message);
        }
    }
    async function handleDeactivate(username) {
        if (!confirm(`Deactivate @${username}?`)) return;
        try {
            await api.admin.deactivate(username);
            toastSuccess("Deactivated", username);
            loadUsers();
        } catch (e) {
            toastError("Failed", e.message);
        }
    }
    async function handleReactivate(username) {
        try {
            await api.admin.reactivate(username);
            toastSuccess("Reactivated", username);
            loadUsers();
        } catch (e) {
            toastError("Failed", e.message);
        }
    }
    onMount(() => {
        loadUsers();
    });
</script>
<div class="admin-panel">
    <div class="header">
        <div class="title">
            <Icon name="lucide:shield-check" size="24" />
            <h1>Admin Dashboard</h1>
        </div>
        <div class="search">
            <Input
                id="user-search"
                placeholder="Search users..."
                bind:value={searchTerm}
                size="sm"
            />
        </div>
    </div>
    <div class="content">
        {#if loading}
            <div class="status-msg">
                <Icon name="lucide:loader-circle" size="24" class="spin" />
                <p>Fetching server inhabitants...</p>
            </div>
        {:else}
            <div class="table-wrapper">
                <table class="user-table">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Status</th>
                            <th>Level</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each filteredUsers as user}
                            <tr class:deactivated={user.deactivated}>
                                <td>
                                    <div class="user-cell">
                                        <Avatar
                                            src={user.profile_picture}
                                            initials={user.username.charAt(0)}
                                            size="32px"
                                            isEnchanted={user.is_enchanted}
                                        />
                                        <div class="meta">
                                            <span class="dname"
                                                >{user.display_name ||
                                                    user.username}</span
                                            >
                                            <span class="uname"
                                                >@{user.username}</span
                                            >
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    {#if user.deactivated}
                                        <span class="status-pill gray"
                                            >Deactivated</span
                                        >
                                    {:else if user.is_enchanted}
                                        <span class="status-pill purple"
                                            >Enchanted</span
                                        >
                                    {:else}
                                        <span class="status-pill green"
                                            >Active</span
                                        >
                                    {/if}
                                </td>
                                <td>
                                    <span class="level-badge"
                                        >{user.level || 1}</span
                                    >
                                </td>
                                <td>
                                    <div class="actions">
                                        <button
                                            class="action-btn"
                                            title="Toggle Enchant"
                                            onclick={() => toggleEnchant(user)}
                                        >
                                            <Icon
                                                name="lucide:sparkles"
                                                size="18"
                                                class={user.is_enchanted
                                                    ? "active"
                                                    : ""}
                                            />
                                        </button>
                                        {#if user.deactivated}
                                            <button
                                                class="action-btn"
                                                title="Reactivate"
                                                onclick={() =>
                                                    handleReactivate(
                                                        user.username,
                                                    )}
                                            >
                                                <Icon
                                                    name="lucide:rotate-ccw"
                                                    size="18"
                                                />
                                            </button>
                                        {:else}
                                            <button
                                                class="action-btn danger"
                                                title="Deactivate"
                                                onclick={() =>
                                                    handleDeactivate(
                                                        user.username,
                                                    )}
                                            >
                                                <Icon
                                                    name="lucide:ban"
                                                    size="18"
                                                />
                                            </button>
                                        {/if}
                                    </div>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        {/if}
    </div>
</div>
<style>
    .admin-panel {
        height: 100%;
        display: flex;
        flex-direction: column;
        background: var(--bg-primary);
    }
    .header {
        padding: 20px;
        border-bottom: 1px solid var(--border-color);
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-shrink: 0;
    }
    .title {
        display: flex;
        align-items: center;
        gap: 12px;
        color: var(--text-primary);
    }
    .title h1 {
        font-size: 1.25rem;
        font-weight: 700;
    }
    .search {
        width: 300px;
    }
    .content {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
    }
    .table-wrapper {
        background: var(--bg-secondary);
        border-radius: 12px;
        overflow: hidden;
        border: 1px solid var(--border-color);
    }
    .user-table {
        width: 100%;
        border-collapse: collapse;
        text-align: left;
    }
    .user-table th {
        padding: 12px 20px;
        background: rgba(0, 0, 0, 0.2);
        font-size: 0.75rem;
        text-transform: uppercase;
        color: var(--text-muted);
        letter-spacing: 0.05em;
    }
    .user-table td {
        padding: 12px 20px;
        border-bottom: 1px solid var(--border-color);
    }
    .user-cell {
        display: flex;
        align-items: center;
        gap: 12px;
    }
    .meta {
        display: flex;
        flex-direction: column;
    }
    .dname {
        font-weight: 600;
        color: var(--text-primary);
    }
    .uname {
        font-size: 0.8rem;
        color: var(--text-muted);
    }
    .status-pill {
        font-size: 0.7rem;
        font-weight: 700;
        padding: 2px 8px;
        border-radius: 12px;
        text-transform: uppercase;
    }
    .status-pill.green {
        background: rgba(67, 181, 129, 0.1);
        color: #43b581;
    }
    .status-pill.purple {
        background: rgba(125, 93, 255, 0.1);
        color: var(--accent-primary);
    }
    .status-pill.gray {
        background: rgba(255, 255, 255, 0.05);
        color: var(--text-muted);
    }
    .level-badge {
        font-size: 0.9rem;
        font-weight: 600;
        color: var(--text-secondary);
    }
    .actions {
        display: flex;
        gap: 8px;
    }
    .action-btn {
        background: transparent;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        padding: 6px;
        border-radius: 6px;
        display: flex;
        transition: all 0.15s;
    }
    .action-btn:hover {
        background: rgba(255, 255, 255, 0.05);
        color: var(--text-primary);
    }
    .action-btn.danger:hover {
        background: rgba(240, 71, 71, 0.1);
        color: var(--danger-color);
    }
    .action-btn :global(.active) {
        color: var(--accent-primary);
        filter: drop-shadow(0 0 4px var(--accent-primary));
    }
    .deactivated {
        opacity: 0.6;
        filter: grayscale(0.2);
    }
    .status-msg {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 16px;
        padding: 100px 0;
        color: var(--text-muted);
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
