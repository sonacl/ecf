<script>
    let {
        src = null,
        alt = "",
        size = "40px",
        status = null,
        initials = "",
        decoration = null,
        isEnchanted = false,
        dotBorder = "var(--bg-secondary)",
        bgColor = "var(--bg-tertiary)",
        class: className = "",
    } = $props();
    const isPredefinedSize = $derived(
        ["xs", "sm", "md", "lg", "xl"].includes(size),
    );
    const sizeMap = {
        xs: "24px",
        sm: "32px",
        md: "40px",
        lg: "48px",
        xl: "80px",
    };
    const computedSize = $derived(isPredefinedSize ? sizeMap[size] : size);
    let imgFailed = $state(false);
    let safeSrc = $derived.by(() => {
        if (!src) return null;
        if (
            src.startsWith("data:image/") &&
            src.length > 100 &&
            !src.match(/[A-Za-z0-9+/=]{10}$/)
        ) {
            return null;
        }
        return src;
    });
    $effect(() => {
        if (src) imgFailed = false;
    });
</script>
<div
    class="avatar-wrapper {isPredefinedSize ? size : ''} {isEnchanted
        ? 'enchanted'
        : ''} {className}"
    style="width: {computedSize}; height: {computedSize}; --dot-border: {dotBorder}; --avatar-bg: {bgColor};"
>
    <div class="avatar-content">
        {#if safeSrc && !imgFailed}
            <img
                src={safeSrc}
                {alt}
                class="avatar-img"
                onerror={() => (imgFailed = true)}
            />
        {:else}
            <div class="avatar-initials">
                {initials || alt?.charAt(0).toUpperCase() || "?"}
            </div>
        {/if}
    </div>
    {#if decoration === "cat_ears"}
        {@const isLarge = parseInt(computedSize) >= 70}
        <img
            class="decoration cat-ears"
            src={isLarge ? "/enchatted/web_assets/cat_ears.gif" : "/enchatted/web_assets/cat_ears_static.png"}
            alt="Cat ears"
            style="width: calc({computedSize} * 1.5); top: calc({computedSize} * -0.35);"
        />
    {:else if decoration === "halo"}
        <div 
            class="decoration halo"
            style="width: calc({computedSize} * 0.8); height: calc({computedSize} * 0.2); top: calc({computedSize} * -0.2);"
        ></div>
    {:else if decoration === "crown"}
         <Icon 
            name="lucide:crown" 
            class="decoration crown" 
            size="calc({computedSize} * 0.6)"
            style="top: calc({computedSize} * -0.4); color: #ffd700; filter: drop-shadow(0 0 5px gold);" 
        />
    {/if}
    {#if status}
        <span
            class="status-dot {status}"
            style="width: calc({computedSize} * 0.3); height: calc({computedSize} * 0.3);"
        ></span>
    {/if}
</div>
<style>
    .halo {
        border: 2px solid #fff;
        border-radius: 50%;
        box-shadow: 0 0 10px #fff, 0 0 20px var(--accent-primary);
        opacity: 0.8;
    }
    .avatar-wrapper {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        color: var(--text-primary);
        font-weight: 600;
    }
    .avatar-content {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        overflow: hidden;
        background-color: var(--avatar-bg, var(--bg-tertiary));
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .avatar-wrapper.enchanted .avatar-content {
        box-shadow: 0 0 10px 2px var(--accent-primary);
        animation: enchanted-glow 2s infinite alternate;
    }
    @keyframes enchanted-glow {
        from {
            box-shadow: 0 0 5px 1px var(--accent-primary);
        }
        to {
            box-shadow:
                0 0 12px 3px var(--accent-primary),
                0 0 20px 5px rgba(124, 106, 255, 0.3);
        }
    }
    .avatar-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    .avatar-initials {
        font-size: 0.9em;
    }
    .status-dot {
        position: absolute;
        bottom: 2%;
        right: 2%;
        border-radius: 50%;
        border: 2px solid var(--dot-border, var(--bg-secondary));
        z-index: 10;
        box-sizing: content-box;
    }
    .status-dot.online {
        background-color: var(--success-color);
    }
    .status-dot.idle {
        background-color: var(--warning-color);
    }
    .status-dot.away {
        background-color: #5865f2;
    }
    .status-dot.dnd {
        background-color: var(--danger-color);
    }
    .status-dot.offline,
    .status-dot.invisible {
        background-color: #747f8d;
    }
    .decoration {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        pointer-events: none;
        z-index: 11;
    }
    .xs {
        font-size: 0.6rem;
    }
    .sm {
        font-size: 0.8rem;
    }
    .md {
        font-size: 0.9rem;
    }
    .lg {
        font-size: 1rem;
    }
    .xl {
        font-size: 2rem;
    }
</style>
