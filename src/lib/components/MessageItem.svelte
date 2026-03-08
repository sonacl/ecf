<script>
    import { formatDate, cn } from "$lib/utils/ui";
    import Icon from "@iconify/svelte";
    let {
        message,
        isSystem = false,
        isGroup = false,
        showAuthor = true,
    } = $props();
    let items = $derived(message.items || []);
</script>

<div
    class={cn(
        "group flex flex-col px-4 py-2 hover:bg-[#1a1c1e] transition-colors",
        isSystem ? "bg-[#1a1c1e]/50 border-l-4 border-accent-primary" : "",
    )}
>
    {#if showAuthor && !isSystem}
        <div class="flex items-center gap-2 mb-1">
            <span
                class="font-semibold text-accent-primary hover:underline cursor-pointer"
            >
                {message.author?.display_name || message.author?.username}
            </span>
            <span class="text-xs text-[#b0b0b0]">
                {formatDate(message.timestamp || new Date())}
            </span>
        </div>
    {/if}
    <div class="flex flex-col gap-2">
        <div class="text-[#dcddde] break-words whitespace-pre-wrap">
            {message.content}
        </div>
        {#if items.length > 0}
            <div class="flex flex-col gap-2 pl-4 border-l-2 border-[#333333]">
                {#each items as item}
                    <div class="flex items-center gap-2 text-sm text-[#b0b0b0]">
                        <Icon icon="lucide:corner-down-right" class="w-4 h-4" />
                        <span>{item.content || item.name}</span>
                    </div>
                {/each}
            </div>
        {/if}
    </div>
    {#if !isSystem}
        <div
            class="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 mt-1"
        >
            <button
                class="text-[#b0b0b0] hover:text-white text-xs flex items-center gap-1"
            >
                <Icon icon="lucide:reply" class="w-3 h-3" /> Reply
            </button>
            <button
                class="text-[#b0b0b0] hover:text-white text-xs flex items-center gap-1"
            >
                <Icon icon="lucide:smile" class="w-3 h-3" /> React
            </button>
        </div>
    {/if}
</div>

<style>
    button {
        background: none;
        border: none;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
    }
</style>
