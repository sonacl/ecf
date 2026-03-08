<script>
    import MessageItem from "./MessageItem.svelte";
    import { formatDay } from "../../utils/ui.js";
    let { messages = [], onReply, onReact, onDelete, onEdit } = $props();
    function shouldGroup(msg, prevMsg) {
        if (!prevMsg) return false;
        if (msg.author?.username !== prevMsg.author?.username) return false;
        const currentTimestamp = new Date(msg.timestamp).getTime();
        const prevTimestamp = new Date(prevMsg.timestamp).getTime();
        return currentTimestamp - prevTimestamp < 5 * 60 * 1000;
    }
    function isNewDay(msg, prevMsg) {
        if (!prevMsg) return true;
        const d1 = new Date(msg.timestamp).toDateString();
        const d2 = new Date(prevMsg.timestamp).toDateString();
        return d1 !== d2;
    }
</script>
<div class="message-list flex flex-col">
    {#each messages as msg, i (msg.id)}
        {#if isNewDay(msg, messages[i - 1])}
            <div class="date-separator">
                <div class="line"></div>
                <span class="date-text">{formatDay(msg.timestamp)}</span>
                <div class="line"></div>
            </div>
        {/if}
        <MessageItem
            {...msg}
            isGrouped={!isNewDay(msg, messages[i - 1]) &&
                shouldGroup(msg, messages[i - 1])}
            {onReply}
            {onReact}
            {onDelete}
            {onEdit}
        />
    {/each}
</div>
<style>
    .message-list {
        display: flex;
        flex-direction: column;
        padding: 16px 0;
        overflow-y: auto;
        flex: 1;
    }
    .date-separator {
        display: flex;
        align-items: center;
        padding: 16px 16px;
        gap: 12px;
    }
    .line {
        flex: 1;
        height: 1px;
        background-color: var(--border-color);
        opacity: 0.5;
    }
    .date-text {
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
</style>
