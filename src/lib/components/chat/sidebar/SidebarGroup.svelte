<script>
    import { onMount } from "svelte";
    import Icon from "../../ui/Icon.svelte";
    import Avatar from "../../ui/Avatar.svelte";
    import { api } from "$lib/utils/api.js";
    import { uiState } from "$lib/state.svelte.js";
    let { groupId } = $props();
    let members = $state([]);
    let loading = $state(true);
    async function load() {
        if (!groupId) return;
        loading = true;
        try {
            const id = groupId.split(":")[1];
            const res = await api.groups.getMembers(id);
            members = Array.isArray(res?.members)
                ? res.members
                : Array.isArray(res)
                  ? res
                  : [];
        } catch (e) {
            console.error("Failed to load group members", e);
        } finally {
            loading = false;
        }
    }
    onMount(() => {
        load();
    });
</script>
<div class="group-view">
    <div class="group-header">
        <div class="group-icon">
            <Icon name="lucide:users" size="32" />
        </div>
        <h3>Group Chat</h3>
    </div>
    <div class="group-members">
        <span class="section-title">Members • {members.length}</span>
        <ul class="member-list">
            {#if loading}
                <li class="loading-state">
                    <Icon name="lucide:loader-circle" size="16" class="spin" />
                    Finding everyone...
                </li>
            {:else}
                {#each members as member}
                    <li
                        onclick={() =>
                            (uiState.viewingProfile = member.username)}
                    >
                        <Avatar
                            src={member.profile_picture}
                            initials={member.username.charAt(0)}
                            size="32px"
                        />
                        <div class="meta">
                            <span class="username"
                                >{member.display_name || member.username}</span
                            >
                            <span class="role">{member.role || "Member"}</span>
                        </div>
                    </li>
                {/each}
            {/if}
        </ul>
    </div>
</div>
<style>
    .group-view {
        padding: 48px 24px;
        text-align: center;
    }
    .group-header h3 {
        font-size: 1.25rem;
        font-weight: 700;
        margin-bottom: 24px;
    }
    .group-icon {
        width: 100px;
        height: 100px;
        background: linear-gradient(135deg, var(--accent-primary), #7289da);
        border-radius: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 24px;
        color: white;
        box-shadow: 0 8px 24px rgba(88, 101, 242, 0.3);
    }
    .section-title {
        display: block;
        font-size: 0.72rem;
        font-weight: 800;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.08em;
        margin-bottom: 12px;
        text-align: left;
    }
    .member-list {
        list-style: none;
        padding: 0;
        margin: 0;
        text-align: left;
    }
    .member-list li {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px;
        border-radius: 4px;
        cursor: pointer;
        transition: background 0.15s;
    }
    .member-list li:hover {
        background: var(--bg-modifier-hover);
    }
    .member-list li .meta {
        display: flex;
        flex-direction: column;
        line-height: 1.2;
    }
    .meta .username {
        font-size: 0.9rem;
        font-weight: 600;
        color: var(--text-primary);
    }
    .meta .role {
        font-size: 0.75rem;
        color: var(--text-muted);
    }
    .loading-state {
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--text-muted);
        font-size: 0.85rem;
        padding: 12px 0;
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
