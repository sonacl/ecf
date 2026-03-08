<script>
    import Icon from "./Icon.svelte";
    let {
        open = false,
        title = "",
        subtitle = "",
        width = "440px",
        onClose,
        children,
    } = $props();
    function handleBackdropClick(e) {
        if (e.target === e.currentTarget) onClose?.();
    }
</script>

{#if open}
    <div
        class="modal-backdrop"
        onclick={handleBackdropClick}
        onkeydown={(e) =>
            (e.key === "Enter" || e.key === " ") && handleBackdropClick(e)}
        role="button"
        tabindex="0"
        aria-label="Close modal"
    >
        <div class="modal-content" style="--modal-width: {width}">
            <button class="close-btn" onclick={onClose}>
                <Icon name="lucide:x" size="20" />
            </button>
            {#if title || subtitle}
                <div class="modal-header">
                    {#if title}
                        <h2>{title}</h2>
                    {/if}
                    {#if subtitle}
                        <p>{subtitle}</p>
                    {/if}
                </div>
            {/if}
            <div class="modal-body">
                {@render children()}
            </div>
        </div>
    </div>
{/if}

<style>
    .modal-backdrop {
        position: fixed;
        inset: 0;
        z-index: 1000;
        background: rgba(0, 0, 0, 0.75);
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(2px);
        animation: fadeIn 0.15s ease-out;
    }
    @keyframes fadeIn {
        from {
            opacity: 0;
        }
    }
    .modal-content {
        width: var(--modal-width);
        max-width: 95vw;
        background: var(--bg-primary);
        border-radius: 8px;
        position: relative;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        border: 1px solid var(--border-color);
        animation: scaleUp 0.15s cubic-bezier(0.18, 0.89, 0.32, 1.28);
        display: flex;
        flex-direction: column;
    }
    @keyframes scaleUp {
        from {
            transform: scale(0.95);
            opacity: 0;
        }
        to {
            transform: scale(1);
            opacity: 1;
        }
    }
    .close-btn {
        position: absolute;
        top: 20px;
        right: 20px;
        background: transparent;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: color 0.1s;
        z-index: 10;
    }
    .close-btn:hover {
        color: var(--text-primary);
    }
    .modal-header {
        padding: 24px 24px 0 24px;
        text-align: left;
    }
    .modal-header h2 {
        font-size: 1.4rem;
        font-weight: 700;
        color: var(--text-primary);
        margin-bottom: 4px;
    }
    .modal-header p {
        font-size: 0.9rem;
        color: var(--text-muted);
        line-height: 1.4;
    }
    .modal-body {
        padding: 24px;
    }
</style>
