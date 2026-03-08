<script>
    import Avatar from "../../ui/Avatar.svelte";
    let { userData, target, isOnline } = $props();
</script>
<div
    class="banner"
    style="background-color: {userData?.banner_color ||
        'var(--accent-primary)'}; 
    {userData?.banner_picture
        ? `background-image: url(${userData.banner_picture})`
        : ''}"
></div>
<div class="avatar-overlap">
    <Avatar
        src={userData?.profile_picture}
        initials={target?.charAt(0)}
        size="92px"
        status={isOnline ? userData?.custom_status || "online" : "offline"}
    />
</div>
<style>
    .banner {
        height: 120px;
        background-size: cover;
        background-position: center;
        flex-shrink: 0;
        position: relative;
        z-index: 1;
    }
    .banner::after {
        content: "";
        position: absolute;
        inset: 0;
        background: linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.4));
    }
    .avatar-overlap {
        margin-top: -50px;
        margin-bottom: 4px;
        padding: 6px;
        background: var(--bg-secondary);
        border-radius: 50%;
        width: fit-content;
        position: relative;
        z-index: 50;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
        margin-left: 16px;
        border: 4px solid var(--bg-secondary);
    }
</style>
