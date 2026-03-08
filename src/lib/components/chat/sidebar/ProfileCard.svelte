<script>
    import { formatDay } from "$lib/utils/ui.js";
    import ProfileEnchantments from "./ProfileEnchantments.svelte";
    let { userData, stats, target, enchantments } = $props();
</script>
<div class="main-card">
    <div class="names">
        <h2 class="display-name">
            {userData?.display_name || target}
        </h2>
        <span class="user-handle">@{target}</span>
    </div>
    <ProfileEnchantments {enchantments} />
    {#if userData?.bio}
        <div class="section">
            <span class="section-title">About Me</span>
            <p class="bio">{userData.bio}</p>
        </div>
    {/if}
    <div class="section">
        <span class="section-title">Member Since</span>
        <p class="date">
            {formatDay(userData?.created_at || userData?.joined_at)}
        </p>
    </div>
    <div class="section">
        <span class="section-title">Statistics</span>
        <div class="stats-grid">
            <div class="stat-box">
                <span class="stat-lab">Messages</span>
                <span class="stat-val">{stats?.total_messages || 0}</span>
            </div>
            <div class="stat-box">
                <span class="stat-lab">Level</span>
                <span class="stat-val">{userData?.level || 1}</span>
            </div>
        </div>
    </div>
</div>
<style>
    .main-card {
        background: var(--bg-tertiary);
        border-radius: 8px;
        padding: 16px;
        border: 1px solid rgba(0, 0, 0, 0.2);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    .display-name {
        font-size: 1.35rem;
        font-weight: 800;
        color: var(--text-primary);
        margin: 0;
        line-height: 1.1;
        letter-spacing: -0.01em;
    }
    .user-handle {
        font-size: 0.9rem;
        color: var(--text-muted);
        display: block;
        margin-top: 2px;
    }
    .section {
        margin-top: 24px;
        padding-top: 20px;
        border-top: 1px solid rgba(255, 255, 255, 0.03);
    }
    .section-title {
        display: block;
        font-size: 0.72rem;
        font-weight: 800;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.08em;
        margin-bottom: 10px;
    }
    .bio {
        font-size: 0.92rem;
        color: var(--text-normal);
        line-height: 1.5;
        white-space: pre-wrap;
    }
    .date {
        font-size: 0.92rem;
        color: var(--text-normal);
        font-weight: 500;
    }
    .stats-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
    }
    .stat-box {
        background: var(--bg-secondary);
        padding: 12px;
        border-radius: 6px;
        display: flex;
        flex-direction: column;
        border: 1px solid rgba(255, 255, 255, 0.04);
        transition: transform 0.15s;
    }
    .stat-box:hover {
        transform: translateY(-2px);
        border-color: rgba(255, 255, 255, 0.1);
    }
    .stat-val {
        font-size: 1.25rem;
        font-weight: 800;
        color: var(--text-primary);
        line-height: 1;
    }
    .stat-lab {
        font-size: 0.65rem;
        color: var(--text-muted);
        text-transform: uppercase;
        font-weight: 800;
        letter-spacing: 0.04em;
        margin-bottom: 4px;
    }
</style>
