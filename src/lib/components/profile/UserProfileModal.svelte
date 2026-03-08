<script>
    import Icon from "../ui/Icon.svelte";
    import Avatar from "../ui/Avatar.svelte";
    import Badge from "../ui/Badge.svelte";
    import Button from "../ui/Button.svelte";
    import { api } from "$lib/utils/api.js";
    import { appState, uiState } from "$lib/state.svelte.js";
    let { username, onClose } = $props();
    let userData = $state(null);
    let stats = $state(null);
    let loading = $state(true);
    $effect(() => {
        if (username) {
            loading = true;
            Promise.all([
                api.profile.getUser(username),
                api.profile.getStats(username),
            ])
                .then(([u, s]) => {
                    userData = u;
                    stats = s;
                    loading = false;
                })
                .catch((err) => {
                    console.error("Failed to load profile:", err);
                    loading = false;
                });
        }
    });
    function handleBackdropClick(e) {
        if (e.target === e.currentTarget) onClose?.();
    }
    const formattedBio = $derived.by(() => {
        const bio = userData?.bio || "No status set.";
        return bio.replace(/@(\w+)/g, '<span class="mention">@$1</span>');
    });
    async function toggleEnchant() {
        if (!userData) return;
        try {
            const newValue = !userData.is_enchanted;
            await api.admin.enchant(username, newValue, userData.level || 1);
            userData.is_enchanted = newValue;
        } catch (e) {
            console.error("Failed to toggle enchant", e);
        }
    }
    async function handleDeactivate() {
        if (!confirm(`Are you sure you want to deactivate @${username}?`))
            return;
        try {
            await api.admin.deactivate(username);
            alert("User deactivated.");
            onClose();
        } catch (e) {
            console.error("Failed to deactivate", e);
        }
    }
    async function handleReactivate() {
        try {
            await api.admin.reactivate(username);
            alert("User reactivated.");
            userData = await api.profile.getUser(username);
        } catch (e) {
            console.error("Failed to reactivate", e);
        }
    }
    const enchantments = $derived.by(() => {
        if (!userData && !stats) return [];
        const items = [];
        const s = stats || {};
        const u = userData || {};

        if (s.efficiency > 0) items.push({ type: "efficiency", level: s.efficiency });
        if (s.loyalty > 0) items.push({ type: "loyalty", level: s.loyalty });
        if (s.multishot > 0) items.push({ type: "multishot", level: 0 });
        
        if (u.twin || s.twin) items.push({ type: "twin", level: 0 });
        if (u.owner || s.owner) items.push({ type: "owner", level: 0 });
        if (u.helper || s.helper) items.push({ type: "helper", level: 0 });
        if (u.supporter || s.supporter) items.push({ type: "supporter", level: 0 });
        if (u.official || s.official) items.push({ type: "official", level: 0 });
        if (u.verified || s.verified) items.push({ type: "verified", level: 0 });
        if (u.boykisser || s.boykisser) items.push({ type: "boykisser", level: 0 });

        const rawBadges = [
            ...(u.badges || u.enchantments || []),
            ...(s.badges || s.enchantments || []),
        ];
        rawBadges.forEach((b) => {
            if (typeof b === "string") {
                if (!items.find(i => i.type === b)) items.push({ type: b, level: 0 });
            } else if (b && typeof b === "object") {
                const type = b.enchant || b.type || b.name || b.id;
                if (type && !items.find(i => i.type === type)) {
                    items.push({ type, level: b.level || 0 });
                }
            }
        });

        const unique = [];
        const seen = new Set();
        items.forEach((item) => {
            if (!seen.has(item.type)) {
                seen.add(item.type);
                unique.push(item);
            }
        });
        return unique;
    });
</script>
{#if username}
    <div
        class="modal-backdrop"
        onclick={handleBackdropClick}
        role="presentation"
    >
        <div class="profile-card">
            <header
                class="card-header"
                style="background-color: {userData?.banner_color || 'var(--accent-primary)'}; {userData?.banner_picture ? `background-image: url(${userData.banner_picture})` : ''}"
            >
                <button class="close-btn" onclick={onClose}>
                    <Icon name="lucide:x" size="20" />
                </button>
            </header>
            <div class="card-body">
                <div class="avatar-holder">
                    <Avatar
                        src={userData?.profile_picture}
                        initials={username.charAt(0)}
                        size="92px"
                        status={userData?.is_online ? userData?.custom_status || "online" : "offline"}
                        isEnchanted={userData?.is_enchanted}
                        decoration={userData?.avatar_decoration}
                        dotBorder="var(--bg-primary)"
                        bgColor="var(--bg-primary)"
                    />
                </div>
                <div class="user-info">
                    <div class="name-row">
                        <h2 class="font-{userData?.display_name_font || 'normal'} {userData?.is_enchanted ? 'enchanted-text' : ''}">
                            {userData?.display_name || username}
                            {#if userData?.official}
                                <img src="/enchatted/web_assets/official.gif" alt="Official" title="Official account of this person" class="inline-badge" />
                            {/if}
                        </h2>
                        <span class="username">@{username}</span>
                    </div>

                    {#if userData?.custom_status}
                        <div class="custom-status-bubble">
                            <span class="status-text">{userData.custom_status}</span>
                        </div>
                    {/if}

                    <div class="badges-row">
                        {#each enchantments as badge}
                            <Badge type={badge.type} level={badge.level} />
                        {/each}
                    </div>

                    <div class="status-msg">
                        {@html formattedBio}
                    </div>

                    {#if userData?.last_seen}
                        <div class="last-seen">
                            Last seen: {new Date(userData.last_seen).toLocaleString()}
                        </div>
                    {/if}
                </div>
                {#if appState.user?.owner && username !== appState.username}
                    <div class="admin-tools">
                        <div class="divider"></div>
                        <h3>Admin Tools</h3>
                        <div class="admin-btns">
                            <Button
                                variant="outline"
                                onclick={toggleEnchant}
                                size="sm"
                            >
                                {userData?.is_enchanted
                                    ? "Unenchant"
                                    : "Enchant"}
                            </Button>
                            {#if userData?.deactivated}
                                <Button
                                    variant="outline"
                                    onclick={handleReactivate}
                                    size="sm"
                                >
                                    Reactivate
                                </Button>
                            {:else}
                                <Button
                                    variant="danger"
                                    onclick={handleDeactivate}
                                    size="sm"
                                >
                                    Deactivate
                                </Button>
                            {/if}
                        </div>
                    </div>
                {/if}
                <div class="divider"></div>
                <div class="stats-grid">
                    <div class="stat-item">
                        <span class="stat-label">Messages</span>
                        <span class="stat-value"
                            >{stats?.total_messages || 0}</span
                        >
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Friends</span>
                        <span class="stat-value"
                            >{stats?.friend_count || 0}</span
                        >
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Level</span>
                        <span class="stat-value">{userData?.level || 1}</span>
                    </div>
                </div>
                <div class="actions">
                    {#if username !== appState.username}
                        <Button
                            variant="primary"
                            fullWidth={true}
                            onclick={() => {
                                appState.currentChat = username;
                                onClose();
                            }}
                        >
                            Send Message
                        </Button>
                    {/if}
                </div>
            </div>
        </div>
    </div>
{/if}
<style>
    .modal-backdrop {
        position: fixed;
        inset: 0;
        z-index: 3000;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.2s ease;
    }
    @keyframes fadeIn {
        from {
            opacity: 0;
        }
    }
    .profile-card {
        width: 340px;
        background: var(--bg-primary);
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5);
        animation: scaleIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    @keyframes scaleIn {
        from {
            transform: scale(0.9);
            opacity: 0;
        }
    }
    .card-header {
        height: 100px;
        position: relative;
        background-size: cover;
        background-position: center;
    }
    .custom-status-bubble {
        margin-top: 8px;
        background: var(--bg-secondary);
        padding: 4px 10px;
        border-radius: 12px;
        font-size: 0.8rem;
        color: var(--text-normal);
        display: inline-flex;
        align-items: center;
        border: 1px solid var(--border-color);
    }
    .badges-row {
        display: flex;
        gap: 6px;
        margin-top: 12px;
    }
    .last-seen {
        margin-top: 12px;
        font-size: 0.75rem;
        color: var(--text-muted);
    }
    .close-btn {
        position: absolute;
        top: 12px;
        right: 12px;
        background: rgba(0, 0, 0, 0.3);
        border: none;
        color: white;
        padding: 4px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        transition: background 0.2s;
    }
    .close-btn:hover {
        background: rgba(0, 0, 0, 0.5);
    }
    .card-body {
        padding: 16px;
        padding-top: 0;
        position: relative;
    }
    .avatar-holder {
        margin-top: -46px;
        margin-bottom: 12px;
        position: relative;
        display: inline-block;
        z-index: 5;
    }
    :global(.profile-avatar-custom .avatar-content) {
        border: 4px solid var(--bg-primary);
    }
    :global(.profile-avatar-custom .status-dot) {
        border-color: var(--bg-primary) !important;
        bottom: 2px !important;
        right: 2px !important;
    }
    .user-info {
        margin-bottom: 16px;
    }
    .name-row {
        margin-bottom: 4px;
    }
    .name-row h2 {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0;
    }
    .username {
        font-size: 0.85rem;
        color: var(--text-muted);
    }
    .status-msg {
        margin-top: 12px;
        font-size: 0.9rem;
        color: var(--text-secondary);
        line-height: 1.4;
        white-space: pre-wrap;
        word-wrap: break-word;
    }
    .status-msg :global(.mention) {
        color: var(--accent-primary);
        font-weight: 600;
        cursor: pointer;
    }
    .status-msg :global(.mention:hover) {
        text-decoration: underline;
    }
    .admin-tools {
        margin-top: 8px;
    }
    .admin-tools h3 {
        font-size: 0.75rem;
        text-transform: uppercase;
        color: var(--text-muted);
        margin-bottom: 8px;
    }
    .admin-btns {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
    }
    .divider {
        height: 1px;
        background: var(--border-color);
        margin: 16px 0;
    }
    .stats-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
        margin-bottom: 20px;
    }
    .stat-item {
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    .stat-label {
        font-size: 0.7rem;
        text-transform: uppercase;
        font-weight: 700;
        color: var(--text-muted);
        margin-bottom: 4px;
    }
    .stat-value {
        font-size: 0.95rem;
        font-weight: 600;
        color: var(--text-primary);
    }
    .actions {
        margin-top: 16px;
    }
</style>
