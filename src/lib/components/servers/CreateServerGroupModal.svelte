<script>
    import Button from "../ui/Button.svelte";
    import Input from "../ui/Input.svelte";
    import Modal from "../ui/Modal.svelte";
    import { api } from "$lib/utils/api.js";
    import { loadServerData } from "$lib/utils/chat.js";
    let { open = $bindable(false), serverId } = $props();
    let name = $state("");
    let loading = $state(false);
    let error = $state("");
    async function handleSubmit(e) {
        e.preventDefault();
        if (!name.trim()) return;
        loading = true;
        error = "";
        try {
            await api.servers.createGroup(serverId, name.trim());
            await loadServerData(serverId);
            name = "";
            open = false;
        } catch (err) {
            error = err.message || "Failed to create category.";
        } finally {
            loading = false;
        }
    }
    function close() {
        if (loading) return;
        open = false;
        name = "";
        error = "";
    }
</script>
<Modal {open} title="Create Category" onClose={close}>
    <form onsubmit={handleSubmit}>
        <Input
            id="group-name"
            label="Category Name"
            bind:value={name}
            placeholder="ENTER NAME"
            maxlength="32"
            {error}
        />
        <div class="modal-footer">
            <button type="button" class="cancel-link" onclick={close}
                >Cancel</button
            >
            <Button
                type="submit"
                variant="primary"
                {loading}
                disabled={!name.trim()}
            >
                Create Category
            </Button>
        </div>
    </form>
</Modal>
<style>
    .modal-footer {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 16px;
        margin-top: 24px;
    }
    .cancel-link {
        background: none;
        border: none;
        color: var(--text-primary);
        font-size: 0.95rem;
        cursor: pointer;
    }
    .cancel-link:hover {
        text-decoration: underline;
    }
</style>
