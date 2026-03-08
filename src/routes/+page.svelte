<script>
    import { browser } from "$app/environment";
    import { goto } from "$app/navigation";
    import { appState } from "$lib/state.svelte.js";
    import Navbar from "$lib/components/layout/Navbar.svelte";
    import Icon from "$lib/components/ui/Icon.svelte";
    import { onMount } from "svelte";
    onMount(() => {
        if (browser && appState.token) goto("/app");
    });
</script>
<div class="landing-page">
    <Navbar />
    <section class="hero">
        <div class="hero-content">
            <div class="hero-badge">✦ Next Generation Chat</div>
            <h1 class="hero-title">
                Where Conversations
                <span class="gradient-text">Come Alive</span>
            </h1>
            <p class="hero-subtitle">
                A modern, real-time chat experience built for communities and
                friends. Servers, DMs, reactions, badges — everything you love,
                reimagined.
            </p>
            <div class="hero-cta">
                <a href="/register" class="btn btn-primary">
                    <Icon name="lucide:zap" size="18" />
                    Start Chatting
                </a>
                <a href="/login" class="btn btn-ghost">
                    <Icon name="lucide:log-in" size="18" />
                    Log In
                </a>
            </div>
        </div>
        <div class="hero-visual">
            <div class="mock-window">
                <div class="window-dots">
                    <span class="dot red"></span>
                    <span class="dot yellow"></span>
                    <span class="dot green"></span>
                </div>
                <div class="window-body">
                    <div class="mock-sidebar">
                        <div class="mock-channel active"></div>
                        <div class="mock-channel"></div>
                        <div class="mock-channel"></div>
                        <div class="mock-channel"></div>
                    </div>
                    <div class="mock-chat">
                        <div class="mock-msg">
                            <div class="mock-avatar"></div>
                            <div class="mock-text">
                                <div class="mock-name"></div>
                                <div class="mock-line long"></div>
                            </div>
                        </div>
                        <div class="mock-msg">
                            <div class="mock-avatar accent"></div>
                            <div class="mock-text">
                                <div class="mock-name accent-bg"></div>
                                <div class="mock-line medium"></div>
                                <div class="mock-line short"></div>
                            </div>
                        </div>
                        <div class="mock-msg">
                            <div class="mock-avatar"></div>
                            <div class="mock-text">
                                <div class="mock-name"></div>
                                <div class="mock-line long"></div>
                                <div class="mock-line medium"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
    <section class="features">
        <div class="features-grid">
            <div class="feature-card">
                <div class="feature-icon">
                    <Icon name="lucide:message-square" size="28" />
                </div>
                <h3>Real-time Messaging</h3>
                <p>
                    Instant DMs and group chats powered by WebSockets. No
                    delays, no refreshing.
                </p>
            </div>
            <div class="feature-card">
                <div class="feature-icon">
                    <Icon name="lucide:server" size="28" />
                </div>
                <h3>Servers & Channels</h3>
                <p>
                    Create your own community with organized channels, roles,
                    and permissions.
                </p>
            </div>
            <div class="feature-card">
                <div class="feature-icon">
                    <Icon name="lucide:sparkles" size="28" />
                </div>
                <h3>Enchantments</h3>
                <p>
                    Unique badge and level system. Earn enchantments as you
                    engage with the community.
                </p>
            </div>
            <div class="feature-card">
                <div class="feature-icon">
                    <Icon name="lucide:shield" size="28" />
                </div>
                <h3>Privacy First</h3>
                <p>
                    Your data stays yours. Secure authentication with JWT tokens
                    and encrypted storage.
                </p>
            </div>
        </div>
    </section>
    <footer class="site-footer">
        <div class="footer-inner">
            <span class="footer-brand">✦ Enchatted</span>
            <span class="footer-copy"
                >© 2026 Enchatted. All rights reserved.</span
            >
        </div>
    </footer>
</div>
<style>
    .landing-page {
        min-height: 100vh;
        background-color: var(--bg-primary);
        overflow-x: hidden;
        overflow-y: auto;
    }
    .hero {
        max-width: 1200px;
        margin: 0 auto;
        padding: 140px 32px 80px;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 64px;
        align-items: center;
    }
    .hero-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 14px;
        background: var(--accent-muted);
        color: var(--accent-primary);
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 600;
        letter-spacing: 0.3px;
        margin-bottom: 20px;
    }
    .hero-title {
        font-size: 3.5rem;
        font-weight: 800;
        line-height: 1.1;
        color: var(--text-primary);
        margin-bottom: 20px;
        letter-spacing: -0.5px;
    }
    .gradient-text {
        background: linear-gradient(
            135deg,
            var(--accent-primary),
            #b97dff,
            #ff7dc7
        );
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }
    .hero-subtitle {
        font-size: 1.1rem;
        color: var(--text-muted);
        line-height: 1.65;
        max-width: 480px;
        margin-bottom: 36px;
    }
    .hero-cta {
        display: flex;
        gap: 12px;
    }
    .btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 12px 24px;
        border-radius: 8px;
        font-weight: 600;
        font-size: 0.95rem;
        text-decoration: none;
        transition: all 0.15s;
    }
    .btn-primary {
        background: var(--accent-primary);
        color: white;
    }
    .btn-primary:hover {
        background: var(--accent-hover);
        transform: translateY(-1px);
        text-decoration: none;
    }
    .btn-ghost {
        background: transparent;
        color: var(--text-secondary);
        border: 1px solid var(--border-color);
    }
    .btn-ghost:hover {
        color: var(--text-primary);
        border-color: rgba(255, 255, 255, 0.12);
        background: var(--bg-modifier-hover);
        text-decoration: none;
    }
    .hero-visual {
        display: flex;
        justify-content: center;
    }
    .mock-window {
        width: 100%;
        max-width: 520px;
        background: var(--bg-secondary);
        border-radius: 12px;
        border: 1px solid var(--border-color);
        overflow: hidden;
        box-shadow: 0 24px 64px rgba(0, 0, 0, 0.4);
    }
    .window-dots {
        display: flex;
        gap: 6px;
        padding: 12px 14px;
        background: var(--bg-tertiary);
    }
    .dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
    }
    .dot.red {
        background: #ff5f57;
    }
    .dot.yellow {
        background: #ffbd2e;
    }
    .dot.green {
        background: #28c840;
    }
    .window-body {
        display: flex;
        height: 280px;
    }
    .mock-sidebar {
        width: 80px;
        background: var(--bg-tertiary);
        padding: 12px 10px;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    .mock-channel {
        height: 12px;
        border-radius: 4px;
        background: rgba(255, 255, 255, 0.06);
    }
    .mock-channel.active {
        background: var(--accent-muted);
    }
    .mock-chat {
        flex: 1;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 16px;
    }
    .mock-msg {
        display: flex;
        gap: 10px;
        animation: fadeInUp 0.6s ease both;
    }
    .mock-msg:nth-child(2) {
        animation-delay: 0.2s;
    }
    .mock-msg:nth-child(3) {
        animation-delay: 0.4s;
    }
    .mock-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: var(--bg-tertiary);
        flex-shrink: 0;
    }
    .mock-avatar.accent {
        background: var(--accent-muted);
    }
    .mock-text {
        display: flex;
        flex-direction: column;
        gap: 6px;
        flex: 1;
    }
    .mock-name {
        height: 10px;
        width: 80px;
        border-radius: 4px;
        background: rgba(255, 255, 255, 0.12);
    }
    .mock-name.accent-bg {
        background: var(--accent-muted);
    }
    .mock-line {
        height: 8px;
        border-radius: 4px;
        background: rgba(255, 255, 255, 0.05);
    }
    .mock-line.long {
        width: 90%;
    }
    .mock-line.medium {
        width: 60%;
    }
    .mock-line.short {
        width: 35%;
    }
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    .features {
        max-width: 1200px;
        margin: 0 auto;
        padding: 80px 32px 100px;
    }
    .features-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 24px;
    }
    .feature-card {
        padding: 28px;
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        border-radius: 12px;
        transition:
            border-color 0.2s,
            transform 0.2s;
    }
    .feature-card:hover {
        border-color: rgba(125, 93, 255, 0.2);
        transform: translateY(-2px);
    }
    .feature-icon {
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--accent-muted);
        color: var(--accent-primary);
        border-radius: 10px;
        margin-bottom: 16px;
    }
    .feature-card h3 {
        font-size: 1rem;
        font-weight: 700;
        color: var(--text-primary);
        margin-bottom: 8px;
    }
    .feature-card p {
        font-size: 0.85rem;
        color: var(--text-muted);
        line-height: 1.55;
    }
    .site-footer {
        border-top: 1px solid var(--border-color);
        padding: 24px 32px;
    }
    .footer-inner {
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    .footer-brand {
        font-weight: 700;
        color: var(--text-primary);
    }
    .footer-copy {
        font-size: 0.8rem;
        color: var(--text-muted);
    }
    @media (max-width: 900px) {
        .hero {
            grid-template-columns: 1fr;
            text-align: center;
            padding-top: 120px;
        }
        .hero-subtitle {
            margin-left: auto;
            margin-right: auto;
        }
        .hero-cta {
            justify-content: center;
        }
        .hero-visual {
            display: none;
        }
        .features-grid {
            grid-template-columns: repeat(2, 1fr);
        }
    }
    @media (max-width: 560px) {
        .hero-title {
            font-size: 2.2rem;
        }
        .features-grid {
            grid-template-columns: 1fr;
        }
    }
</style>
