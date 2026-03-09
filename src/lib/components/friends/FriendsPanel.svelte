<script>
  import Icon from '../ui/Icon.svelte';
  import Button from '../ui/Button.svelte';
  import FriendListItem from './FriendListItem.svelte';
  import { appState, uiState } from '$lib/stores/index.svelte.js';
  import { api } from '$lib/utils/api.js';
  import { refreshFriendData, openDm } from '$lib/utils/chat.js';
  import { toastError, toastSuccess } from '$lib/utils/toast.svelte.js';
  let activeTab = $state('online');
  let addUsername = $state('');
  let addLoading = $state(false);
  const onlineFriends = $derived(appState.friends.filter((f) => appState.onlineUsers.has(f)));
  const offlineFriends = $derived(appState.friends.filter((f) => !appState.onlineUsers.has(f)));
  const pendingCount = $derived(
    (appState.requests?.length || 0) + (appState.sentRequests?.length || 0),
  );
  const tabs = [
    { id: 'online', label: 'Online' },
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Pending' },
    { id: 'add', label: 'Add Friend' },
  ];
  function friendActions(friend) {
    return [
      {
        title: 'Message',
        icon: 'lucide:message-square',
        onClick: () => openDm(friend),
      },
      {
        title: 'Remove Friend',
        icon: 'lucide:user-x',
        variant: 'danger',
        onClick: () => removeFriend(friend),
      },
    ];
  }
  async function handleAddFriend(e) {
    e.preventDefault();
    const target = addUsername.trim();
    if (!target) {
      toastError('Error', 'Enter a username.');
      return;
    }
    addLoading = true;
    try {
      await api.friends.add(target);
      toastSuccess('Success', `Friend request sent to @${target}!`);
      addUsername = '';
      const sent = await api.friends.getSentRequests();
      appState.sentRequests = sent || [];
    } catch (err) {
      toastError('Failed to add friend', err.message || 'Failed to send request.');
    } finally {
      addLoading = false;
    }
  }
  async function acceptRequest(from) {
    try {
      await api.friends.respond(from, true);
      await refreshFriendData();
    } catch (err) {
      console.error('Accept failed:', err);
    }
  }
  async function denyRequest(from) {
    try {
      await api.friends.respond(from, false);
      await refreshFriendData();
    } catch (err) {
      console.error('Deny failed:', err);
    }
  }
  async function cancelSentRequest(to) {
    try {
      await api.friends.cancel(to);
      const sent = await api.friends.getSentRequests();
      appState.sentRequests = sent || [];
    } catch (err) {
      console.error('Cancel failed:', err);
    }
  }
  async function removeFriend(username) {
    try {
      await api.friends.remove(username);
      const friends = await api.friends.list();
      appState.friends = Array.isArray(friends)
        ? friends.map((f) => (typeof f === 'string' ? f : f.username)).filter(Boolean)
        : [];
    } catch (err) {
      console.error('Remove failed:', err);
    }
  }
</script>

<div class="friends-panel">
  <div class="fp-header">
    <div class="fp-title">
      <button class="mobile-menu-btn" onclick={() => (uiState.mobileSidebarOpen = true)}>
        <Icon name="lucide:menu" size="24" />
      </button>
      <Icon name="lucide:users" size="20" class="hide-on-mobile" />
      <h2>Friends</h2>
    </div>
    <div class="fp-tabs">
      {#each tabs as tab}
        <Button
          variant="ghost"
          onClick={() => (activeTab = tab.id)}
          class="fp-tab {activeTab === tab.id ? 'active' : ''} {tab.id === 'add' ? 'green' : ''}"
          size="sm"
        >
          {tab.label}
          {#if tab.id === 'pending' && pendingCount > 0}
            <span class="tab-badge">{pendingCount}</span>
          {/if}
        </Button>
      {/each}
    </div>
  </div>
  <div class="fp-body">
    {#if activeTab === 'online'}
      <div class="fp-section-label">
        Online • {onlineFriends.length}
      </div>
      {#if onlineFriends.length === 0}
        <div class="fp-empty">
          <Icon name="lucide:wifi-off" size="32" />
          <p>No friends online right now.</p>
        </div>
      {:else}
        <ul class="fp-list">
          {#each onlineFriends as friend}
            <FriendListItem
              username={friend}
              statusOverride="Online"
              actions={friendActions(friend)}
            />
          {/each}
        </ul>
      {/if}
    {:else if activeTab === 'all'}
      <div class="fp-section-label">
        All Friends • {appState.friends.length}
      </div>
      {#if appState.friends.length === 0}
        <div class="fp-empty">
          <Icon name="lucide:user-plus" size="32" />
          <p>You don't have any friends yet. Add someone!</p>
        </div>
      {:else}
        <ul class="fp-list">
          {#each appState.friends as friend}
            <FriendListItem username={friend} actions={friendActions(friend)} />
          {/each}
        </ul>
      {/if}
    {:else if activeTab === 'pending'}
      <div class="fp-section-label">
        Incoming • {appState.requests?.length || 0}
      </div>
      {#if !appState.requests?.length}
        <div class="fp-empty-sm">No incoming friend requests.</div>
      {:else}
        <ul class="fp-list">
          {#each appState.requests as req}
            <FriendListItem
              username={req.from || req}
              statusOverride="Incoming Friend Request"
              actions={[
                {
                  title: 'Accept',
                  icon: 'lucide:check',
                  variant: 'accept',
                  onClick: () => acceptRequest(req.from || req),
                },
                {
                  title: 'Deny',
                  icon: 'lucide:x',
                  variant: 'danger',
                  onClick: () => denyRequest(req.from || req),
                },
              ]}
            />
          {/each}
        </ul>
      {/if}
      <div class="fp-section-label" style="margin-top: 16px;">
        Sent • {appState.sentRequests?.length || 0}
      </div>
      {#if !appState.sentRequests?.length}
        <div class="fp-empty-sm">No pending sent requests.</div>
      {:else}
        <ul class="fp-list">
          {#each appState.sentRequests as req}
            <FriendListItem
              username={req.to || req}
              statusOverride="Outgoing | Pending"
              actions={[
                {
                  title: 'Cancel',
                  icon: 'lucide:x',
                  variant: 'danger',
                  onClick: () => cancelSentRequest(req.to || req),
                },
              ]}
            />
          {/each}
        </ul>
      {/if}
    {:else if activeTab === 'add'}
      <div class="fp-add-section">
        <h3>Add Friend</h3>
        <p>You can add a friend with their username.</p>
        <form class="fp-add-form" onsubmit={handleAddFriend}>
          <div class="fp-add-input-row">
            <input
              type="text"
              bind:value={addUsername}
              placeholder="Enter a username"
              autocomplete="off"
            />
            <Button
              type="submit"
              variant="primary"
              disabled={addLoading || !addUsername.trim()}
              size="sm"
            >
              {addLoading ? 'Sending...' : 'Send Request'}
            </Button>
          </div>
        </form>
      </div>
    {/if}
  </div>
</div>

<style>
  .friends-panel {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: var(--bg-primary);
  }
  .fp-header {
    padding: 14px 20px;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    gap: 20px;
    flex-shrink: 0;
  }
  .fp-title {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--text-primary);
    flex-shrink: 0;
  }
  .fp-title h2 {
    font-size: 1rem;
    font-weight: 700;
  }
  .fp-tabs {
    display: flex;
    gap: 4px;
  }
  .tab-badge {
    background: var(--danger-color);
    color: white;
    font-size: 0.7rem;
    font-weight: 700;
    padding: 1px 5px;
    border-radius: 8px;
    min-width: 16px;
    text-align: center;
  }
  .fp-body {
    flex: 1;
    overflow-y: auto;
    padding: 12px 20px;
  }
  .fp-section-label {
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 8px 0;
  }
  .fp-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .fp-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 48px 0;
    color: var(--text-muted);
    text-align: center;
    opacity: 0.6;
  }
  .fp-empty-sm {
    padding: 12px 8px;
    font-size: 0.85rem;
    color: var(--text-muted);
  }
  .fp-add-section {
    padding: 8px 0;
  }
  .fp-add-section h3 {
    font-size: 1rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 6px;
  }
  .fp-add-section p {
    font-size: 0.85rem;
    color: var(--text-muted);
    margin-bottom: 16px;
  }
  .fp-add-form {
    margin-bottom: 12px;
  }
  .fp-add-input-row {
    display: flex;
    gap: 8px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 4px;
    align-items: center;
    padding-left: 12px;
  }
  .fp-add-input-row input {
    flex: 1;
    background: transparent;
    border: none;
    color: var(--text-primary);
    font-size: 0.95rem;
    padding: 8px 0;
  }
  .fp-add-input-row input::placeholder {
    color: var(--text-muted);
  }
  .mobile-menu-btn {
    display: none;
    padding: 4px;
    color: var(--text-muted);
    margin-right: 4px;
    background: transparent;
    border: none;
    cursor: pointer;
  }
  .fp-title {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  @media (max-width: 768px) {
    .mobile-menu-btn {
      display: flex;
    }
    :global(.hide-on-mobile) {
      display: none !important;
    }
    .fp-tabs {
      gap: 4px;
      overflow-x: auto;
      padding-bottom: 2px;
    }
    :global(.fp-tab) {
      padding: 4px 8px !important;
      font-size: 0.85rem !important;
      white-space: nowrap;
    }
    .fp-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
      height: auto;
      padding: 12px 16px;
    }
  }
</style>
