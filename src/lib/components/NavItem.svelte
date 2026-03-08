<script>
	import Icon from '@iconify/svelte';
	import { cn } from '$lib/utils/ui';
	let { 
		icon, 
		label, 
		active = false, 
		onClick, 
		class: className = '', 
		type = 'button',
		variant = 'ghost' 
	} = $props();
	const variants = {
		ghost: 'hover:bg-[#323232] text-[#8e9297] hover:text-[#dcddde]',
		active: 'bg-[#40444b] text-white',
		danger: 'text-[#ed4245] hover:bg-[#ed4245] hover:text-white'
	};
</script>
<button
	{type}
	onclick={onClick}
	class={cn(
		'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ease-in-out',
		active ? variants.active : variants.ghost,
		className
	)}
>
	{#if icon}
		<Icon {icon} class="mr-3 h-6 w-6 flex-shrink-0" />
	{/if}
	<span class="truncate">{label}</span>
</button>
<style>
	button {
		outline: none;
		border: none;
		background: none;
		color: inherit;
		cursor: pointer;
		width: 100%;
		text-align: left;
	}
</style>
