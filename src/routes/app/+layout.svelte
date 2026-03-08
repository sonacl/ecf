<script>
    import { browser } from "$app/environment";
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import { appState } from "$lib/state.svelte.js";
    import { api } from "$lib/utils/api.js";
    import GlobalServices from "$lib/components/GlobalServices.svelte";
    import ToastContainer from "$lib/components/ui/ToastContainer.svelte";
    let { children } = $props();
    let ready = $state(false);
    onMount(async () => {
        if (browser) {
            if (!appState.token) {
                goto("/login");
                return;
            }
            try {
                const me = await api.profile.getMe();
                if (me) appState.user = me;
            } catch (e) {
                console.error("Initial load failed:", e);
            }
            ready = true;
        }
    });
</script>

{#if ready}
    <GlobalServices />
    <ToastContainer />
    {@render children()}
{:else}
    <div class="loading-screen">
        <div class="loading-content">
            <div class="brand-wrapper">
                <span class="brand-logo">✦</span>
                <div class="loading-spinner"></div>
            </div>
            <h1 class="brand-text">Enchatted</h1>
        </div>
    </div>
{/if}

<style>
    .loading-screen {
        height: 100vh;
        width: 100vw;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #111214;
        color: white;
    }
    .loading-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 32px;
    }
    .brand-wrapper {
        position: relative;
        width: 80px;
        height: 80px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .brand-logo {
        font-size: 3rem;
        color: var(--accent-primary, #5865f2);
        z-index: 2;
        filter: drop-shadow(0 0 15px rgba(88, 101, 242, 0.4));
        animation: pulse 2s infinite ease-in-out;
    }
    .loading-spinner {
        position: absolute;
        width: 100%;
        height: 100%;
        border: 2px solid transparent;
        border-top-color: var(--accent-primary, #5865f2);
        border-bottom-color: var(--accent-primary, #5865f2);
        border-radius: 50%;
        animation: spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
    }
    .brand-text {
        font-size: 1.8rem;
        font-weight: 800;
        letter-spacing: -0.02em;
        background: linear-gradient(135deg, #fff 0%, #a5a6ff 100%);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        margin: 0;
        opacity: 0.9;
    }
    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }
    @keyframes pulse {
        0%,
        100% {
            opacity: 1;
            transform: scale(1);
        }
        50% {
            opacity: 0.7;
            transform: scale(0.95);
        }
    }
</style>
