<script>
    let {
        children,
        onClick,
        variant = "primary",
        size = "md",
        fullWidth = false,
        disabled = false,
        type = "button",
    } = $props();
    const variants = {
        primary: "var(--accent-primary)",
        secondary: "var(--bg-tertiary)",
        danger: "var(--text-danger)",
        ghost: "transparent",
    };
</script>
<button
    {type}
    onclick={onClick}
    {disabled}
    class="btn {variant} {size} {fullWidth ? 'full-width' : ''}"
>
    {@render children()}
</button>
<style>
    .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 8px 16px;
        border-radius: 4px;
        font-weight: 500;
        transition: all 0.2s;
        color: white;
        border: none;
        gap: 8px;
    }
    .btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
    .primary {
        background-color: var(--accent-primary);
    }
    .primary:hover:not(:disabled) {
        filter: brightness(1.1);
    }
    .secondary {
        background-color: var(--bg-tertiary);
        color: var(--text-normal);
    }
    .secondary:hover:not(:disabled) {
        background-color: var(--bg-modifier-hover);
    }
    .danger {
        border: 1px solid var(--text-danger);
        color: var(--text-danger);
    }
    .danger:hover:not(:disabled) {
        background-color: var(--text-danger);
        color: white;
    }
    .ghost {
        color: var(--text-muted);
    }
    .ghost:hover:not(:disabled) {
        background-color: var(--bg-modifier-hover);
        color: var(--text-normal);
    }
    .sm {
        padding: 4px 12px;
        font-size: 0.8rem;
    }
    .md {
        padding: 8px 20px;
        font-size: 0.9rem;
    }
    .lg {
        padding: 12px 24px;
        font-size: 1rem;
    }
    .full-width {
        width: 100%;
    }
</style>
