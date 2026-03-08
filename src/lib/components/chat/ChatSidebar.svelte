<script>
  import Icon from '../ui/Icon.svelte';
  import SidebarLoading from './sidebar/SidebarLoading.svelte';
  import SidebarGroup from './sidebar/SidebarGroup.svelte';
  import ProfileHeader from './sidebar/ProfileHeader.svelte';
  import ProfileCard from './sidebar/ProfileCard.svelte';
  import { api } from '$lib/utils/api.js';
  import { appState, uiState } from '$lib/state.svelte.js';
  let { target } = $props();
  let userData = $state(null);
  let stats = $state(null);
  let loading = $state(true);
  const isGroup = $derived(target?.startsWith('group:'));
  $effect(() => {
    if (target && !isGroup && !target.startsWith('channel:')) {
      loading = true;
      Promise.all([api.profile.getUser(target), api.profile.getStats(target)])
        .then(([u, s]) => {
          userData = u;
          stats = s;
          loading = false;
        })
        .catch((err) => {
          console.error('Failed to load sidebar profile:', err);
          loading = false;
        });
    } else {
      loading = false;
    }
  });
  const enchantments = $derived.by(() => {
    if (!userData && !stats) return [];
    const items = [];
    const s = stats || {};
    const u = userData || {};

    if (s.efficiency > 0) items.push({ type: 'efficiency', level: s.efficiency });
    if (s.loyalty > 0) items.push({ type: 'loyalty', level: s.loyalty });
    if (s.multishot > 0) items.push({ type: 'multishot', level: 0 });

    if (u.twin || s.twin) items.push({ type: 'twin', level: 0 });
    if (u.owner || s.owner) items.push({ type: 'owner', level: 0 });
    if (u.helper || s.helper) items.push({ type: 'helper', level: 0 });
    if (u.supporter || s.supporter) items.push({ type: 'supporter', level: 0 });
    if (u.official || s.official) items.push({ type: 'official', level: 0 });
    if (u.verified || s.verified) items.push({ type: 'verified', level: 0 });
    if (u.boykisser || s.boykisser) items.push({ type: 'boykisser', level: 0 });

    const rawBadges = [
      ...(u.badges || u.enchantments || []),
      ...(s.badges || s.enchantments || []),
    ];
    rawBadges.forEach((b) => {
      if (typeof b === 'string') {
        if (!items.find((i) => i.type === b)) items.push({ type: b, level: 0 });
      } else if (b && typeof b === 'object') {
        const type = b.enchant || b.type || b.name || b.id;
        if (type && !items.find((i) => i.type === type)) {
          items.push({ type, level: b.level || 0 });
        }
      }
    });

    // Ensure uniqueness
    const unique = [];
    const seen = new Set();
    items.forEach((item) => {
      if (!seen.has(item.type)) {
        seen.add(item.type);
        unique.push(item);
      }
    });
    return unique;
  });
  const isOnline = $derived(target && appState.onlineUsers.has(target));
  function handleKeydown(e) {
    if (e.key === 'Escape' && uiState.sidebarOpen) {
      uiState.sidebarOpen = false;
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />
<aside class="chat-sidebar">
  <button
    class="close-sidebar-btn"
    title="Close Sidebar"
    onclick={() => (uiState.sidebarOpen = false)}
  >
    <Icon name="lucide:arrow-right" size="18" />
  </button>
  {#if loading}
    <SidebarLoading />
  {:else if isGroup}
    <SidebarGroup groupId={target} />
  {:else if userData}
    <div class="profile-scroll">
      <ProfileHeader {userData} {target} {isOnline} />
      <div class="profile-content">
        <ProfileCard {userData} {stats} {target} {enchantments} />
      </div>
    </div>
  {/if}
</aside>

<style>
  .chat-sidebar {
    width: 340px;
    background: var(--bg-secondary);
    border-left: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    flex-shrink: 0;
    animation: slideIn 0.2s ease-out;
    position: relative;
  }
  @keyframes slideIn {
    from {
      transform: translateX(20px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  .profile-scroll {
    flex: 1;
    overflow-y: auto;
    position: relative;
    display: flex;
    flex-direction: column;
  }
  .profile-scroll::-webkit-scrollbar {
    width: 4px;
  }
  .profile-scroll::-webkit-scrollbar-thumb {
    background: var(--bg-tertiary);
    border-radius: 4px;
  }
  .profile-content {
    padding: 16px;
    padding-top: 0;
    position: relative;
    z-index: 2;
  }
  .close-sidebar-btn {
    position: absolute;
    top: 12px;
    right: 12px;
    background: rgba(0, 0, 0, 0.4);
    border: none;
    color: white;
    padding: 6px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    transition: background 0.2s;
  }
  .close-sidebar-btn:hover {
    background: rgba(0, 0, 0, 0.6);
  }
</style>
