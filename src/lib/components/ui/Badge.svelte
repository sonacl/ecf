<script>
    let { type, level = 0, tooltip = "" } = $props();
    const roman = (n) => ["", "I", "II", "III", "IV", "V"][n] || n;
    const badgeData = {
        efficiency: {
            src: "/enchatted/web_assets/enchant_book.webp",
            alt: "Efficiency",
            label: "Efficiency",
        },
        loyalty: {
            src: "/enchatted/web_assets/enchant_book.webp",
            alt: "Loyalty",
            label: "Loyalty",
        },
        multishot: {
            src: "/enchatted/web_assets/enchant_book.webp",
            alt: "Multishot",
            label: "Multishot - this user has at least 20 friends",
        },
        twin: {
            src: "/enchatted/web_assets/twin.gif",
            alt: "Twin",
            label: "Twin",
        },
        owner: {
            src: "/enchatted/web_assets/owner.gif",
            alt: "Founder",
            label: "Founder",
        },
        helper: {
            src: "/enchatted/web_assets/helper.gif",
            alt: "Helper",
            label: "Helper | Dev team",
        },
        supporter: {
            src: "/enchatted/web_assets/supporter.png",
            alt: "Supporter",
            label: "Supporter - Thanks for donating!",
        },
        official: {
            src: "/enchatted/web_assets/official.gif",
            alt: "Official",
            label: "Official account of this person",
        },
        verified: {
            src: "/enchatted/web_assets/og.png",
            alt: "Verified",
            label: "Verified - Account registered over 30 days ago (or just verified by an admin)",
        },
        boykisser: {
            src: "/enchatted/web_assets/boykisser.png",
            alt: "Boykisser",
            label: "Verified Boykisser :3",
        },
        moderator: {
            src: "/enchatted/web_assets/mod.gif",
            alt: "Moderator",
            label: "Moderator",
        },
    };
    const data = $derived(
        badgeData[type] || {
            src: "/enchatted/web_assets/enchant_book.webp",
            alt: type,
            label: type,
        },
    );
    const fullLabel = $derived(
        level > 0 ? `${data.label} ${roman(level)}` : tooltip || data.label,
    );
</script>
<div class="badge-wrapper" title={fullLabel}>
    {#if data.src}
        <img src={data.src} alt={data.alt} />
    {/if}
</div>
<style>
    .badge-wrapper {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 18px;
        height: 18px;
        cursor: help;
        transition: transform 0.1s;
    }
    .badge-wrapper:hover {
        transform: scale(1.2);
    }
    img {
        width: 100%;
        height: 100%;
        object-fit: contain;
    }
</style>
