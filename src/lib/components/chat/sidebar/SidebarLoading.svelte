<aside class="loading-state">
    <div class="skeleton-banner"></div>
    <div class="skeleton-avatar"></div>
    <div class="skeleton-content">
        <div class="skeleton-line"></div>
        <div class="skeleton-line short"></div>
        <div class="skeleton-line"></div>
    </div>
</aside>
<style>
    .loading-state {
        padding: 0;
    }
    .skeleton-banner {
        height: 120px;
        background: var(--bg-tertiary);
    }
    .skeleton-avatar {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background: var(--bg-tertiary);
        margin: -40px 16px 16px;
        border: 4px solid var(--bg-secondary);
    }
    .skeleton-content {
        padding: 16px;
    }
    .skeleton-line {
        height: 16px;
        background: var(--bg-tertiary);
        border-radius: 4px;
        margin-bottom: 12px;
    }
    .skeleton-line.short {
        width: 60%;
    }
    .skeleton-banner,
    .skeleton-avatar,
    .skeleton-line {
        animation: shimmer 2s infinite ease-in-out;
    }
    @keyframes shimmer {
        0%,
        100% {
            opacity: 0.5;
        }
        50% {
            opacity: 0.8;
        }
    }
</style>
