<script>
    import Button from "../ui/Button.svelte";
    import Input from "../ui/Input.svelte";
    import Modal from "../ui/Modal.svelte";
    import Icon from "../ui/Icon.svelte";
    import { api } from "$lib/utils/api.js";
    let { open = false, serverId, onClose, onCreated } = $props();
    let channelName = $state("");
    let channelDescription = $state("");
    let loading = $state(false);
    let errorMsg = $state("");
    async function handleCreate(e) {
        e.preventDefault();
        errorMsg = "";
        if (!channelName.trim()) {
            errorMsg = "Channel name is required.";
            return;
        }
        loading = true;
        try {
            const res = await api.servers.createChannel(
                serverId,
                channelName.trim().replace(/\s+/g, "-").toLowerCase(),
                channelDescription.trim(),
            );
            if (res) {
                channelName = "";
                channelDescription = "";
                onCreated?.(res);
                onClose?.();
            }
        } catch (err) {
            errorMsg = err.message || "Failed to create channel.";
        } finally {
            loading = false;
        }
    }
</script>
<Modal
    {open}
    title="Create Channel"
    subtitle="Channels are where your server members talk."
    {onClose}
>
    {#if errorMsg}
        <div class="error-banner">
            <Icon name="lucide:alert-circle" size="14" />
            {errorMsg}
        </div>
    {/if}
    <form onsubmit={handleCreate}>
        <Input
            id="cc-name"
            label="Channel Name"
            bind:value={channelName}
            placeholder="new-channel"
            prefix="#"
            required
        />
        <Input
            id="cc-desc"
            type="textarea"
            label="Description (optional)"
            bind:value={channelDescription}
            placeholder="What's this channel for?"
        />
        <div class="modal-footer">
            <button type="button" class="cancel-link" onclick={onClose}>
                Cancel
            </button>
            <Button
                type="submit"
                variant="primary"
                disabled={loading || !channelName.trim()}
            >
                {loading ? "Creating..." : "Create Channel"}
            </Button>
        </div>
    </form>
</Modal>
<style>
    .error-banner {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 14px;
        background: rgba(240, 71, 71, 0.1);
        border: 1px solid rgba(240, 71, 71, 0.2);
        border-radius: 4px;
        color: #f04747;
        font-size: 0.85rem;
        margin-bottom: 20px;
    }
    .modal-footer {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: 24px;
        margin-top: 16px;
        background: var(--bg-secondary);
        margin: 0 -24px -24px -24px;
        padding: 16px 24px;
        border-radius: 0 0 8px 8px;
    }
    .cancel-link {
        background: transparent;
        border: none;
        color: var(--text-primary);
        font-size: 0.9rem;
        cursor: pointer;
        padding: 0;
    }
    .cancel-link:hover {
        text-decoration: underline;
    }
</style>
