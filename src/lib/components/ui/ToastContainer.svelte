<script>
    import { toastState, removeToast } from "$lib/utils/toast.svelte.js";
    import Icon from "./Icon.svelte";
    function getIcon(type) {
        if (type === "error") return "lucide:alert-circle";
        if (type === "success") return "lucide:check-circle";
        return "lucide:info";
    }
</script>

<div class="toast-container">
    {#each toastState.toasts as toast (toast.id)}
        <div
            class="toast"
            class:error={toast.type === "error"}
            class:success={toast.type === "success"}
        >
            <div class="toast-icon">
                <Icon name={getIcon(toast.type)} size="20" />
            </div>
            <div class="toast-content">
                <strong>{toast.title}</strong>
                {#if toast.message}
                    <p>{toast.message}</p>
                {/if}
            </div>
            <button class="toast-close" onclick={() => removeToast(toast.id)}>
                <Icon name="lucide:x" size="16" />
            </button>
        </div>
    {/each}
</div>

<style>
    .toast-container {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 12px;
        pointer-events: none;
    }
    .toast {
        background: rgba(17, 19, 24, 0.85);
        backdrop-filter: blur(12px);
        border: 1px solid var(--border-color);
        color: var(--text-primary);
        padding: 14px 16px;
        border-radius: 8px;
        width: 320px;
        box-shadow:
            0 8px 24px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
        display: flex;
        align-items: flex-start;
        gap: 12px;
        pointer-events: auto;
        cursor: pointer;
        animation: slideIn 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28);
        transition:
            transform 0.2s,
            box-shadow 0.2s,
            background 0.2s;
    }
    .toast:hover {
        transform: translateY(-2px);
        box-shadow:
            0 12px 28px rgba(0, 0, 0, 0.5),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
        background: rgba(17, 19, 24, 0.95);
    }
    .toast-icon {
        flex-shrink: 0;
        margin-top: 2px;
        color: var(--accent-primary);
        filter: drop-shadow(0 0 8px rgba(124, 106, 255, 0.4));
    }
    .toast.error .toast-icon {
        color: var(--danger-color);
        filter: drop-shadow(0 0 8px rgba(240, 71, 71, 0.4));
    }
    .toast.success .toast-icon {
        color: var(--success-color);
        filter: drop-shadow(0 0 8px rgba(67, 181, 129, 0.4));
    }
    .toast-content {
        flex: 1;
        min-width: 0;
    }
    .toast-content strong {
        display: block;
        font-size: 0.9rem;
        font-weight: 700;
        margin-bottom: 2px;
    }
    .toast-content p {
        font-size: 0.8rem;
        color: var(--text-muted);
        line-height: 1.4;
        margin: 0;
    }
    .toast-close {
        background: transparent;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        opacity: 0;
        transition: all 0.2s;
        margin-top: 0px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .toast:hover .toast-close {
        opacity: 1;
    }
    .toast-close:hover {
        color: var(--text-primary);
        background: var(--bg-modifier-hover);
    }
    @keyframes slideIn {
        from {
            transform: translateX(120%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
</style>
