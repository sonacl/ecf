<script>
    import Icon from "../ui/Icon.svelte";
    import Button from "../ui/Button.svelte";
    import Input from "../ui/Input.svelte";
    import Modal from "../ui/Modal.svelte";
    import { api } from "$lib/utils/api.js";
    let { open = false, onClose, onCreated } = $props();
    let activeMode = $state("create");
    let serverName = $state("");
    let serverDescription = $state("");
    let inviteCode = $state("");
    let loading = $state(false);
    let errorMsg = $state("");
    async function handleCreate(e) {
        e.preventDefault();
        errorMsg = "";
        if (!serverName.trim()) {
            errorMsg = "Server name is required.";
            return;
        }
        loading = true;
        try {
            const res = await api.servers.create(
                serverName.trim(),
                serverDescription.trim(),
            );
            if (res) {
                serverName = "";
                serverDescription = "";
                onCreated?.(res);
                onClose?.();
            }
        } catch (err) {
            errorMsg = err.message || "Failed to create server.";
        } finally {
            loading = false;
        }
    }
    async function handleJoin(e) {
        e.preventDefault();
        errorMsg = "";
        if (!inviteCode.trim()) {
            errorMsg = "Invite code is required.";
            return;
        }
        loading = true;
        try {
            const res = await api.servers.join(inviteCode.trim());
            if (res) {
                inviteCode = "";
                onCreated?.(res);
                onClose?.();
            }
        } catch (err) {
            errorMsg = err.message || "Invalid or expired invite code.";
        } finally {
            loading = false;
        }
    }
</script>
<Modal
    {open}
    title={activeMode === "create" ? "Create a Server" : "Join a Server"}
    subtitle={activeMode === "create"
        ? "Give your new server a personality with a name and description."
        : "Enter an invite code to join an existing server."}
    {onClose}
>
    <div class="mode-toggle">
        <button
            class:active={activeMode === "create"}
            onclick={() => {
                activeMode = "create";
                errorMsg = "";
            }}>Create</button
        >
        <button
            class:active={activeMode === "join"}
            onclick={() => {
                activeMode = "join";
                errorMsg = "";
            }}>Join</button
        >
    </div>
    {#if errorMsg}
        <div class="error-banner">
            <Icon name="lucide:alert-circle" size="14" />
            {errorMsg}
        </div>
    {/if}
    {#if activeMode === "create"}
        <form onsubmit={handleCreate}>
            <Input
                id="cs-name"
                label="Server Name"
                bind:value={serverName}
                placeholder="My Awesome Server"
                required
            />
            <Input
                id="cs-desc"
                type="textarea"
                label="Description (optional)"
                bind:value={serverDescription}
                placeholder="What's your server about?"
            />
            <Button
                type="submit"
                variant="primary"
                fullWidth={true}
                disabled={loading}
            >
                {loading ? "Creating..." : "Create Server"}
            </Button>
        </form>
    {:else}
        <form onsubmit={handleJoin}>
            <Input
                id="cs-invite"
                label="Invite Code"
                bind:value={inviteCode}
                placeholder="Enter an invite code"
                required
            />
            <Button
                type="submit"
                variant="primary"
                fullWidth={true}
                disabled={loading}
            >
                {loading ? "Joining..." : "Join Server"}
            </Button>
        </form>
    {/if}
</Modal>
<style>
    .mode-toggle {
        display: flex;
        gap: 4px;
        background: var(--bg-secondary);
        border-radius: 8px;
        padding: 4px;
        margin-top: -10px;
        margin-bottom: 20px;
    }
    .mode-toggle button {
        flex: 1;
        padding: 8px;
        background: transparent;
        border: none;
        border-radius: 6px;
        color: var(--text-muted);
        font-weight: 600;
        font-size: 0.85rem;
        cursor: pointer;
        transition: all 0.15s;
    }
    .mode-toggle button.active {
        background: var(--accent-primary);
        color: white;
    }
    .error-banner {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 14px;
        background: rgba(240, 71, 71, 0.1);
        border: 1px solid rgba(240, 71, 71, 0.2);
        border-radius: 8px;
        color: var(--danger-color);
        font-size: 0.85rem;
        margin-bottom: 16px;
    }
</style>
