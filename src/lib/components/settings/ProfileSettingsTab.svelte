<script>
    import { browser } from "$app/environment";
    import Avatar from "../ui/Avatar.svelte";
    import Button from "../ui/Button.svelte";
    import Input from "../ui/Input.svelte";
    import Icon from "../ui/Icon.svelte";
    import { appState } from "$lib/stores/index.svelte.js";
    import { api } from "$lib/utils/api.js";
    import { toastError, toastSuccess } from "$lib/utils/toast.svelte.js";
    let displayName = $state(appState.user?.display_name || "");
    let bio = $state(appState.user?.bio || "");
    let customStatus = $state(appState.user?.custom_status || "online");
    let newUsername = $state(appState.user?.username || "");
    let profilePictureFile = $state(null);
    let profilePicturePreview = $state(appState.user?.profile_picture || null);
    let bannerFile = $state(null);
    let bannerPreview = $state(appState.user?.banner_picture || null);
    let profileLoading = $state(false);
    let usernameLoading = $state(false);
    const statusOptions = [
        { value: "online", label: "Online", color: "#43b581" },
        { value: "idle", label: "Idle", color: "#faa61a" },
        { value: "dnd", label: "Do Not Disturb", color: "#ed4245" },
        { value: "away", label: "Away", color: "#5865f2" },
    ];
    async function saveProfile() {
        profileLoading = true;
        try {
            const data = {
                display_name: displayName,
                bio: bio,
                custom_status: customStatus,
            };
            if (profilePictureFile) {
                const fd = new FormData();
                fd.append("file", profilePictureFile);
                const uploadRes = await api.upload(fd);
                if (uploadRes?.url) data.profile_picture = uploadRes.url;
            }
            if (bannerFile) {
                const fd = new FormData();
                fd.append("file", bannerFile);
                const uploadRes = await api.upload(fd);
                if (uploadRes?.url) data.banner_picture = uploadRes.url;
            }
            await api.profile.update(data);
            const fresh = await api.profile.getMe();
            if (fresh) appState.user = fresh;
            toastSuccess(
                "Profile updated",
                "Your profile has been saved successfully.",
            );
        } catch (e) {
            toastError(
                "Failed to save profile",
                e.message || "An error occurred.",
            );
        } finally {
            profileLoading = false;
        }
    }
    async function saveUsername() {
        usernameLoading = true;
        const u = newUsername.trim();
        if (!u || u.length < 3 || u.length > 20) {
            toastError("Invalid Username", "Username must be 3–20 characters.");
            usernameLoading = false;
            return;
        }
        try {
            const res = await api.profile.changeUsername(u);
            if (res?.success) {
                if (res.token && browser) {
                    appState.token = res.token;
                    appState.username = u;
                    localStorage.setItem("token", res.token);
                    localStorage.setItem("username", u);
                }
                toastSuccess("Username updated", `Your username is now @${u}`);
            } else {
                toastError(
                    "Failed to change username",
                    res?.error || "Unknown error.",
                );
            }
        } catch (e) {
            toastError(
                "Failed to change username",
                e.message || "Unknown error.",
            );
        } finally {
            usernameLoading = false;
        }
    }
    function handleAvatarSelect(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        profilePictureFile = file;
        const reader = new FileReader();
        reader.onload = (ev) => (profilePicturePreview = ev.target.result);
        reader.readAsDataURL(file);
    }
    function handleBannerSelect(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        bannerFile = file;
        const reader = new FileReader();
        reader.onload = (ev) => (bannerPreview = ev.target.result);
        reader.readAsDataURL(file);
    }
</script>
<h2>My Account</h2>
<div class="profile-card">
    <div
        class="banner-area"
        style={bannerPreview ? `background-image: url('${bannerPreview}')` : ""}
        onclick={() => document.getElementById("bannerInput").click()}
    >
        <span class="upload-hint">Change Banner</span>
    </div>
    <div
        class="avatar-edit"
        onclick={() => document.getElementById("avatarInput").click()}
    >
        <Avatar
            src={profilePicturePreview}
            initials={(displayName || appState.user?.username || "U").charAt(0)}
            size="80px"
        />
        <span class="avatar-upload-hint"
            ><Icon name="lucide:camera" size="16" /></span
        >
    </div>
    <input
        type="file"
        id="avatarInput"
        accept="image/*"
        onchange={handleAvatarSelect}
        hidden
    />
    <input
        type="file"
        id="bannerInput"
        accept="image/*"
        onchange={handleBannerSelect}
        hidden
    />
</div>
<Input
    id="s-displayName"
    label="Display Name"
    bind:value={displayName}
    placeholder="Your display name"
/>
<Input
    id="s-bio"
    type="textarea"
    label="Bio"
    bind:value={bio}
    placeholder="Tell us about yourself..."
/>
<div class="form-section">
    <span class="label-heading">Status</span>
    <div class="status-row">
        {#each statusOptions as opt}
            <button
                class="status-chip"
                class:active={customStatus === opt.value}
                onclick={() => (customStatus = opt.value)}
            >
                <span class="status-dot" style="background:{opt.color}"></span>
                {opt.label}
            </button>
        {/each}
    </div>
</div>
<div class="form-section username-update">
    <Input
        id="s-username"
        label="Username"
        bind:value={newUsername}
        placeholder="New username"
        maxlength={20}
    />
    <div class="inline-btn">
        <Button
            variant="primary"
            onClick={saveUsername}
            disabled={usernameLoading ||
                newUsername === appState.user?.username}
            size="sm"
        >
            {usernameLoading ? "..." : "Change"}
        </Button>
    </div>
</div>
<div class="actions">
    <Button
        variant="primary"
        onClick={saveProfile}
        disabled={profileLoading}
        fullWidth={false}
    >
        {profileLoading ? "Saving..." : "Save Changes"}
    </Button>
</div>
<style>
    h2 {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--text-primary);
        margin-bottom: 24px;
    }
    .profile-card {
        position: relative;
        margin-bottom: 32px;
        border-radius: 8px;
        overflow: hidden;
        border: 1px solid var(--border-color);
    }
    .banner-area {
        height: 100px;
        background: linear-gradient(135deg, #1a0a2e, #2d0a4e, #7d0587);
        background-size: cover;
        background-position: center;
        cursor: pointer;
        position: relative;
        transition: filter 0.15s;
    }
    .banner-area:hover {
        filter: brightness(0.8);
    }
    .upload-hint {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.4);
        color: white;
        font-size: 0.8rem;
        font-weight: 600;
        opacity: 0;
        transition: opacity 0.15s;
    }
    .banner-area:hover .upload-hint {
        opacity: 1;
    }
    .avatar-edit {
        position: absolute;
        bottom: -40px;
        left: 16px;
        cursor: pointer;
        border-radius: 50%;
        border: 4px solid var(--bg-primary);
    }
    .avatar-upload-hint {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.5);
        border-radius: 50%;
        opacity: 0;
        color: white;
        transition: opacity 0.15s;
    }
    .avatar-edit:hover .avatar-upload-hint {
        opacity: 1;
    }
    .form-section {
        margin-bottom: 20px;
    }
    .status-row {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
    }
    .status-chip {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 14px;
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        border-radius: 20px;
        color: var(--text-secondary);
        font-size: 0.85rem;
        cursor: pointer;
        transition: all 0.15s;
    }
    .status-chip:hover {
        border-color: rgba(255, 255, 255, 0.12);
    }
    .status-chip.active {
        border-color: var(--accent-primary);
        background: var(--accent-muted);
        color: var(--text-primary);
    }
    .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
    }
    .label-heading {
        display: block;
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 6px;
    }
    .username-update {
        position: relative;
    }
    .inline-btn {
        position: absolute;
        bottom: 6px;
        right: 6px;
    }
</style>
