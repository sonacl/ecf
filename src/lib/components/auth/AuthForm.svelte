<script>
    import Icon from "$lib/components/ui/Icon.svelte";
    let {
        title = "",
        subtitle = "",
        fields = [],
        submitLabel = "Submit",
        error = "",
        loading = false,
        onSubmit,
        footerText = "",
        footerLinkText = "",
        footerLinkHref = "",
    } = $props();
</script>
<div class="auth-card">
    <div class="auth-header">
        <span class="auth-brand">✦</span>
        <h1>{title}</h1>
        <p>{subtitle}</p>
    </div>
    <form class="auth-form" onsubmit={onSubmit}>
        {#if error}
            <div class="error-banner">
                <Icon name="lucide:alert-circle" size="16" />
                {error}
            </div>
        {/if}
        {#each fields as field}
            {#if field.type === "row"}
                <div class="form-row">
                    {#each field.children as child}
                        <div class="form-group">
                            <label for={child.id}>
                                {child.label}
                                {#if child.required}<span class="required"
                                        >*</span
                                    >{/if}
                            </label>
                            <input
                                id={child.id}
                                type={child.inputType || "text"}
                                value={child.value}
                                oninput={(e) => child.onInput(e.target.value)}
                                placeholder={child.placeholder}
                                required={child.required}
                                autocomplete={child.autocomplete || "off"}
                                class:mismatch={child.mismatch}
                            />
                        </div>
                    {/each}
                </div>
            {:else}
                <div class="form-group">
                    <label for={field.id}>
                        {field.label}
                        {#if field.required}<span class="required">*</span>{/if}
                    </label>
                    <input
                        id={field.id}
                        type={field.inputType || "text"}
                        value={field.value}
                        oninput={(e) => field.onInput(e.target.value)}
                        placeholder={field.placeholder}
                        required={field.required}
                        autocomplete={field.autocomplete || "off"}
                    />
                </div>
            {/if}
        {/each}
        <button type="submit" class="submit-btn" disabled={loading}>
            {#if loading}
                <span class="spinner"></span>
                {submitLabel}...
            {:else}
                {submitLabel}
            {/if}
        </button>
        {#if footerText}
            <p class="auth-footer">
                {footerText} <a href={footerLinkHref}>{footerLinkText}</a>
            </p>
        {/if}
    </form>
</div>
<style>
    .auth-card {
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        border-radius: 12px;
        padding: 40px 36px;
    }
    .auth-header {
        text-align: center;
        margin-bottom: 28px;
    }
    .auth-brand {
        font-size: 2rem;
        color: var(--accent-primary);
        display: block;
        margin-bottom: 12px;
    }
    .auth-header h1 {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--text-primary);
        margin-bottom: 6px;
    }
    .auth-header p {
        font-size: 0.9rem;
        color: var(--text-muted);
    }
    .auth-form {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }
    .error-banner {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 14px;
        background: rgba(240, 71, 71, 0.1);
        border: 1px solid rgba(240, 71, 71, 0.2);
        border-radius: 8px;
        color: var(--text-danger);
        font-size: 0.85rem;
    }
    .form-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
        flex: 1;
    }
    .form-group label {
        font-size: 0.8rem;
        font-weight: 700;
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    .required {
        color: var(--text-danger);
    }
    .form-group input {
        padding: 10px 12px;
        background: var(--bg-primary);
        border: 1px solid var(--border-color);
        border-radius: 6px;
        color: var(--text-primary);
        font-size: 0.95rem;
        transition: border-color 0.15s;
    }
    .form-group input:focus {
        border-color: var(--accent-primary);
    }
    .form-group input::placeholder {
        color: var(--text-muted);
    }
    .form-group input.mismatch {
        border-color: var(--text-danger);
    }
    .form-row {
        display: flex;
        gap: 12px;
    }
    .submit-btn {
        width: 100%;
        padding: 12px;
        background: var(--accent-primary);
        color: white;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        font-size: 0.95rem;
        cursor: pointer;
        transition: background 0.15s;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        margin-top: 4px;
    }
    .submit-btn:hover:not(:disabled) {
        background: var(--accent-hover);
    }
    .submit-btn:disabled {
        opacity: 0.65;
        cursor: not-allowed;
    }
    .spinner {
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top-color: white;
        border-radius: 50%;
        animation: spin 0.6s linear infinite;
    }
    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }
    .auth-footer {
        text-align: center;
        font-size: 0.85rem;
        color: var(--text-muted);
    }
    .auth-footer a {
        color: var(--accent-primary);
        text-decoration: none;
        font-weight: 500;
    }
    .auth-footer a:hover {
        text-decoration: underline;
    }
</style>
