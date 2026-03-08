<script>
    import { onMount } from "svelte";
    import { browser } from "$app/environment";
    import { appState } from "$lib/state.svelte.js";
    let orbAudio;
    let levelupAudio;
    let mentionAudio;
    function requestNotificationPermission() {
        if (
            browser &&
            "Notification" in window &&
            Notification.permission === "default"
        ) {
            Notification.requestPermission().catch(() => {});
        }
    }
    function sendNotification(sender, content) {
        if (
            browser &&
            "Notification" in window &&
            Notification.permission === "granted" &&
            document.hidden
        ) {
            try {
                const n = new Notification(`${sender} sent a message`, {
                    body: content.slice(0, 100),
                    icon: "/enchatted/web_assets/icon.png",
                    tag: "enchatted-dm-" + sender,
                });
                setTimeout(() => n.close(), 5000);
                n.onclick = () => {
                    window.focus();
                    n.close();
                };
            } catch (e) {}
        }
    }
    let lastUnreadTotal = 0;
    $effect(() => {
        if (!browser) return;
        const total = Object.values(appState.unreadMessages).reduce(
            (a, b) => a + (b || 0),
            0,
        );
        document.title =
            total > 0
                ? `(${total > 99 ? "99+" : total}) Enchatted`
                : "Enchatted";
        if (total > lastUnreadTotal) {
            playOrb();
            const recent = Object.keys(appState.unreadMessages).find(
                (k) => appState.unreadMessages[k] > 0,
            );
            if (recent) sendNotification(recent, "New message");
        }
        lastUnreadTotal = total;
    });
    function playOrb() {
        if (orbAudio && !document.hasFocus()) {
            orbAudio.currentTime = 0;
            orbAudio.play().catch(() => {});
        }
    }
    onMount(() => {
        if (browser) {
            orbAudio = new Audio("/enchatted/web_assets/orb.mp3");
            levelupAudio = new Audio("/enchatted/web_assets/levelup.mp3");
            mentionAudio = new Audio("/enchatted/web_assets/mention.mp3");
            requestNotificationPermission();
            const el = document.createElement("div");
            el.id = "_encFontPreloader";
            el.style.cssText =
                "position:absolute;left:-9999px;top:-9999px;visibility:hidden;pointer-events:none;font-size:1px;";
            el.innerHTML =
                "<span style=\"font-family:'EncPixel',monospace;\">.</span>" +
                "<span style=\"font-family:'EncComic',cursive;\">.</span>" +
                "<span style=\"font-family:'EncTypewriter',monospace;\">.</span>" +
                "<span style=\"font-family:'EncDigital',monospace;\">.</span>" +
                "<span style=\"font-family:'EncBold',sans-serif;\">.</span>";
            document.body.appendChild(el);
        }
    });
</script>
