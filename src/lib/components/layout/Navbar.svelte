<script>
    import Icon from "$lib/components/ui/Icon.svelte";
    let { transparent = false } = $props();
</script>
<nav class="navbar" class:transparent>
    <div class="nav-inner">
        <a href="/" class="nav-brand">
            <span class="brand-icon">◈</span>
            <span class="brand-text">Enchatted</span>
        </a>
        <div class="nav-links">
            <a href="/login" class="nav-link">Log In</a>
            <a href="/register" class="nav-btn primary">Get Started</a>
        </div>
    </div>
</nav>
<style>
    .navbar {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 100;
        background: rgba(18, 18, 20, 0.85);
        backdrop-filter: blur(16px);
        border-bottom: 1px solid var(--border-light);
    }
    .navbar.transparent {
        background: transparent;
        border-bottom: none;
        backdrop-filter: none;
    }
    .nav-inner {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 32px;
        height: 64px;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    .nav-brand {
        display: flex;
        align-items: center;
        gap: 10px;
        text-decoration: none;
        color: var(--text-primary);
        font-weight: 700;
        font-size: 1.25rem;
    }
    .nav-brand:hover {
        text-decoration: none;
    }
    .brand-icon {
        color: var(--accent-primary);
        font-size: 1.4rem;
    }
    .nav-links {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .nav-link {
        padding: 8px 16px;
        color: var(--text-secondary);
        font-weight: 500;
        font-size: 0.9rem;
        text-decoration: none;
        border-radius: 6px;
        transition:
            color 0.15s,
            background 0.15s;
    }
    .nav-link:hover {
        color: var(--text-primary);
        background: var(--bg-modifier-hover);
        text-decoration: none;
    }
    .nav-btn {
        padding: 8px 20px;
        border-radius: 6px;
        font-weight: 600;
        font-size: 0.9rem;
        text-decoration: none;
        transition: all 0.15s;
    }
    .nav-btn.primary {
        background: var(--accent-primary);
        color: white;
    }
    .nav-btn.primary:hover {
        background: var(--accent-hover);
        text-decoration: none;
    }
</style>
