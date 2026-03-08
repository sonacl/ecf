<script>
    let {
        id,
        label,
        value = $bindable(""),
        placeholder = "",
        type = "text",
        required = false,
        prefix = "",
        maxlength = null,
        error = "",
    } = $props();
</script>
<div class="form-group" class:has-error={!!error}>
    {#if label}
        <label for={id}>{label}</label>
    {/if}
    <div class="input-wrapper">
        {#if prefix}
            <span class="prefix">{prefix}</span>
        {/if}
        {#if type === "textarea"}
            <textarea
                {id}
                bind:value
                {placeholder}
                {required}
                {maxlength}
                class:has-prefix={!!prefix}
                rows="3"
            ></textarea>
        {:else}
            <input
                {id}
                {type}
                bind:value
                {placeholder}
                {required}
                {maxlength}
                class:has-prefix={!!prefix}
            />
        {/if}
    </div>
    {#if error}
        <span class="error-msg">{error}</span>
    {/if}
</div>
<style>
    .form-group {
        margin-bottom: 20px;
        text-align: left;
    }
    label {
        display: block;
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 8px;
    }
    .input-wrapper {
        position: relative;
        display: flex;
        align-items: center;
    }
    .prefix {
        position: absolute;
        left: 12px;
        color: var(--text-muted);
        font-size: 1.2rem;
        font-weight: 400;
        pointer-events: none;
        user-select: none;
        z-index: 1;
        opacity: 0.8;
    }
    input,
    textarea {
        width: 100%;
        background: var(--bg-tertiary);
        border: 1px solid rgba(0, 0, 0, 0.3);
        border-radius: 4px;
        color: var(--text-normal);
        font-size: 0.95rem;
        font-family: inherit;
        transition:
            border-color 0.15s,
            box-shadow 0.15s;
    }
    input {
        height: 44px;
        padding: 0 12px;
    }
    textarea {
        resize: vertical;
        padding: 12px;
        min-height: 80px;
    }
    .has-prefix {
        padding-left: 36px;
    }
    input:focus,
    textarea:focus {
        border-color: var(--accent-primary);
        outline: none;
    }
    .form-group.has-error input,
    .form-group.has-error textarea {
        border-color: var(--danger-color);
    }
    .error-msg {
        display: block;
        color: var(--danger-color);
        font-size: 0.8rem;
        margin-top: 6px;
    }
</style>
