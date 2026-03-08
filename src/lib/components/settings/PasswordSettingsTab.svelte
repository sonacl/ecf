<script>
    import { browser } from "$app/environment";
    import Button from "../ui/Button.svelte";
    import Input from "../ui/Input.svelte";
    import { api } from "$lib/utils/api.js";
    import { toastError, toastSuccess } from "$lib/utils/toast.svelte.js";
    let oldPassword = $state("");
    let newPassword = $state("");
    let confirmPassword = $state("");
    let passwordLoading = $state(false);
    let deactivatePassword = $state("");
    let deactivateLoading = $state(false);
    async function savePassword() {
        passwordLoading = true;
        if (!oldPassword || !newPassword || !confirmPassword) {
            toastError("Validation Error", "All fields are required.");
            passwordLoading = false;
            return;
        }
        if (newPassword !== confirmPassword) {
            toastError("Validation Error", "Passwords don't match.");
            passwordLoading = false;
            return;
        }
        if (newPassword.length < 6) {
            toastError(
                "Validation Error",
                "Password must be at least 6 characters.",
            );
            passwordLoading = false;
            return;
        }
        try {
            await api.profile.changePassword(oldPassword, newPassword);
            toastSuccess("Success", "Password changed successfully!");
            if (browser) localStorage.setItem("_enc_p", btoa(newPassword));
            oldPassword = "";
            newPassword = "";
            confirmPassword = "";
        } catch (e) {
            toastError("Error", e.message || "Failed to change password.");
        } finally {
            passwordLoading = false;
        }
    }
    async function handleDeactivate() {
        if (!deactivatePassword) {
            toastError(
                "Validation Error",
                "Password is required to deactivate.",
            );
            return;
        }
        if (
            !confirm(
                "Are you absolutely sure you want to deactivate your account? This action cannot be undone and you will be logged out immediately.",
            )
        ) {
            return;
        }
        deactivateLoading = true;
        try {
            await api.auth.deactivate(deactivatePassword);
            toastSuccess("Account Deactivated", "You have been logged out.");
            if (browser) window.location.href = "/login";
        } catch (e) {
            toastError(
                "Deactivation Error",
                e.message || "Failed to deactivate account.",
            );
            deactivateLoading = false;
        }
    }
</script>
<h2>Change Password</h2>
<form
    onsubmit={(e) => {
        e.preventDefault();
        savePassword();
    }}
>
    <Input
        id="s-oldpw"
        type="password"
        label="Current Password"
        bind:value={oldPassword}
        placeholder="Enter current password"
        required
    />
    <Input
        id="s-newpw"
        type="password"
        label="New Password"
        bind:value={newPassword}
        placeholder="Enter new password"
        required
    />
    <Input
        id="s-confirmpw"
        type="password"
        label="Confirm New Password"
        bind:value={confirmPassword}
        placeholder="Confirm new password"
        required
    />
    <div class="actions">
        <Button
            type="submit"
            variant="primary"
            disabled={passwordLoading}
            fullWidth={false}
        >
            {passwordLoading ? "Saving..." : "Change Password"}
        </Button>
    </div>
</form>
<div class="danger-zone">
    <h2>Danger Zone</h2>
    <p class="warning-text">
        Deactivating your account will block login access and invalidate all
        active sessions. Your data will be preserved, but you will need an
        administrator to reactivate your account.
    </p>
    <form
        onsubmit={(e) => {
            e.preventDefault();
            handleDeactivate();
        }}
    >
        <Input
            id="s-deactivatepw"
            type="password"
            label="Confirm Password to Deactivate"
            bind:value={deactivatePassword}
            placeholder="Current password"
            required
        />
        <div class="actions">
            <Button
                type="submit"
                variant="danger"
                disabled={deactivateLoading}
                fullWidth={false}
            >
                {deactivateLoading ? "Deactivating..." : "Deactivate Account"}
            </Button>
        </div>
    </form>
</div>
<style>
    h2 {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--text-primary);
        margin-bottom: 24px;
    }
    .actions {
        margin-top: 24px;
    }
    .danger-zone {
        margin-top: 48px;
        padding-top: 24px;
        border-top: 1px solid var(--danger-color);
        border-top-color: rgba(240, 71, 71, 0.3);
    }
    .danger-zone h2 {
        color: var(--danger-color);
        margin-bottom: 8px;
    }
    .warning-text {
        font-size: 0.85rem;
        color: var(--text-muted);
        margin-bottom: 24px;
        line-height: 1.5;
    }
</style>
