import { tick } from 'svelte';
import { browser } from '$app/environment';
import { api } from '$lib/utils/api.js';
import { wsConnect } from '$lib/utils/ws.js';
import { appState, uiState } from '$lib/state.svelte.js';
import { updateTabTitle, requestNotificationPermission, initFontPreloader } from '$lib/utils/ui.js';
export async function loadInitialData() {
  uiState.initialLoading = true;
  try {
    const [profile, friends, requests, sent, servers, dms, groups] = await Promise.all([
      api.profile.getMe(),
      api.friends.list(),
      api.friends.getRequests(),
      api.friends.getSentRequests(),
      api.servers.list(),
      api.dms.list(),
      api.groups.list(),
    ]);
    appState.user = profile;
    appState.username = profile.username;
    appState.friends = Array.isArray(friends)
      ? friends.map((f) => (typeof f === 'string' ? f : f.username)).filter(Boolean)
      : [];
    appState.dms = Array.isArray(dms) ? dms : [];
    appState.groups = Array.isArray(groups) ? groups : [];
    appState.requests = requests || [];
    appState.sentRequests = sent || [];
    appState.servers = Array.isArray(servers?.servers)
      ? servers.servers
      : Array.isArray(servers)
        ? servers
        : [];

    await warmProfileCache();
  } catch (e) {
    console.error('[chat] Initial data fetch failed:', e);
  } finally {
    uiState.initialLoading = false;
  }
}
export async function refreshFriendData() {
  try {
    const [friends, requests, sent, dms, groups] = await Promise.all([
      api.friends.list(),
      api.friends.getRequests(),
      api.friends.getSentRequests(),
      api.dms.list(),
      api.groups.list(),
    ]);
    appState.friends = Array.isArray(friends)
      ? friends.map((f) => (typeof f === 'string' ? f : f.username)).filter(Boolean)
      : [];
    appState.dms = Array.isArray(dms) ? dms : [];
    appState.groups = Array.isArray(groups) ? groups : [];
    appState.requests = requests || [];
    appState.sentRequests = sent || [];
    warmProfileCache();
  } catch (e) {
    console.error('[chat] Friend refresh failed:', e);
  }
}
async function warmProfileCache() {
  const toFetch = new Set([...appState.friends, ...appState.dms.map((d) => d.username)]);
  const promises = [];
  toFetch.forEach((f) => {
    if (!f) return;
    if (!appState.profileCache[f]) {
      promises.push(
        api.profile
          .getUser(f)
          .then((p) => {
            if (p) appState.profileCache[f] = p;
          })
          .catch(() => {}),
      );
    }
  });
  await Promise.all(promises);
}
export function markChatSeen(target) {
  if (!target) return;
  if (target.startsWith('group:')) {
    const gid = target.split(':')[1];
    api.groups.markSeen(gid);
    appState.unreadMessages[target] = 0;
  } else if (!target.startsWith('channel:')) {
    api.messages.markSeen(target);
    appState.unreadMessages[target] = 0;
  }
}
export async function fetchMessages(target) {
  try {
    let msgs;
    if (target.startsWith('channel:')) {
      const [_, channelId] = target.split(':');
      msgs = await api.servers.getChannelMessages(appState.activeServerId, channelId);
    } else if (target.startsWith('group:')) {
      const [_, groupId] = target.split(':');
      msgs = await api.groups.getMessages(groupId);
    } else {
      msgs = await api.messages.get(target, 50);
    }
    const res = Array.isArray(msgs?.messages) ? msgs.messages : Array.isArray(msgs) ? msgs : [];
    res.forEach((m) => {
      const sender = m.sender || m.author?.username;
      if (sender && sender !== appState.username && !appState.profileCache[sender]) {
        api.profile
          .getUser(sender)
          .then((u) => {
            if (u) appState.profileCache[sender] = u;
          })
          .catch(() => {});
      }
    });
    const finalMsgs = res.map((m) => ({
      id: m.id || m._id || Math.random().toString(36).substring(2, 11),
      author: {
        username: m.sender || m.author?.username || 'unknown',
        display_name: m.display_name,
        profile_picture: m.pfp,
      },
      content: m.content || '',
      timestamp: m.created_at || m.timestamp || new Date().toISOString(),
      reactions: m.reactions || {},
      attachments: m.attachments || [],
      reply_to: m.reply_to || null,
    }));
    appState.messages = finalMsgs;
    return finalMsgs;
  } catch (e) {
    console.error('[chat] Failed to fetch messages:', e);
    return [];
  }
}
export async function sendMessage(target, content) {
  uiState.isSending = true;
  const tempId = `tmp-${Date.now()}`;
  const optimisticMsg = {
    id: tempId,
    author: {
      username: appState.username,
      display_name: appState.user?.display_name || appState.username,
      profile_picture: appState.user?.profile_picture,
    },
    content,
    timestamp: new Date().toISOString(),
    reactions: {},
    pending: true,
  };
  appState.messages = [...appState.messages, optimisticMsg];
  try {
    let res;
    if (target.startsWith('channel:')) {
      const channelId = target.split(':')[1];
      res = await api.servers.sendChannelMessage(appState.activeServerId, channelId, content);
    } else {
      res = await api.messages.send(target, content);
    }
    if (res) {
      uiState.pendingReply = null;
      uiState.editingMessage = null;
      const m = res.message || res;
      const finalMsg = {
        id: m.id || m._id || tempId,
        author: {
          username: appState.username,
          display_name: appState.user?.display_name || appState.username,
          profile_picture: appState.user?.profile_picture,
        },
        content: m.content || content,
        timestamp: m.created_at || m.timestamp || new Date().toISOString(),
        reactions: {},
        pending: false,
      };
      const exists = appState.messages.some((msg) => msg.id === finalMsg.id && msg.id !== tempId);
      if (exists) {
        appState.messages = appState.messages.filter((msg) => msg.id !== tempId);
      } else {
        appState.messages = appState.messages.map((msg) => (msg.id === tempId ? finalMsg : msg));
      }
      return finalMsg;
    } else {
      appState.messages = appState.messages.filter((msg) => msg.id !== tempId);
    }
    return null;
  } catch (e) {
    console.error('[chat] Send failed:', e);
    appState.messages = appState.messages.filter((msg) => msg.id !== tempId);
    return null;
  } finally {
    uiState.isSending = false;
  }
}
export async function scrollToBottom(container) {
  await tick();
  if (container) {
    container.scrollTop = container.scrollHeight;
  }
}
export function startServices() {
  if (!browser || !appState.token) return () => {};
  wsConnect();
  requestNotificationPermission();
  initFontPreloader();
  const hb = setInterval(() => {
    if (appState.token) api.auth.heartbeat('desktop').catch(() => {});
  }, 30000);
  const pl = setInterval(() => {
    if (appState.token) {
      api.auth.poll().catch(() => {});
      updateTabTitle();
    }
  }, 10000);
  let lastUpdateCheck = new Date().toISOString();
  const up = setInterval(async () => {
    if (!appState.token || !appState.activeChat) return;
    try {
      const target = appState.activeChat;
      if (target.startsWith('group:') || target.startsWith('channel:')) return;
      const res = await api.messages.getUpdates(target, lastUpdateCheck);
      if (res && res.updates && res.updates.length > 0) {
        appState.messages = appState.messages.map((msg) => {
          const update = res.updates.find((u) => u.id === msg.id);
          if (update) {
            return {
              ...msg,
              content: update.content,
              deleted: update.deleted,
            };
          }
          return msg;
        });
        lastUpdateCheck = new Date().toISOString();
      }
    } catch (e) {}
  }, 3000);
  return () => {
    clearInterval(hb);
    clearInterval(pl);
    clearInterval(up);
  };
}
export function getChannelInfo(chatId) {
  if (!chatId) return null;
  if (chatId.startsWith('channel:')) {
    const id = parseInt(chatId.split(':')[1]);
    const serverId = appState.activeServerId;
    const channels = appState.serverChannels[serverId] || [];
    const channel = channels.find((c) => c.id === id);
    return {
      name: channel?.name || `channel:${id}`,
      isDM: false,
      subtitle: channel?.topic || '',
    };
  }
  if (chatId.startsWith('group:')) {
    return { name: 'Group Chat', isDM: false, subtitle: 'Multi-user' };
  }
  const profile = appState.profileCache[chatId];
  return {
    name: profile?.display_name || chatId,
    isDM: true,
    subtitle: appState.onlineUsers.has(chatId) ? 'Online' : 'Offline',
  };
}
export async function openDm(username) {
  if (!username || username === 'friends' || username === 'admin' || username === 'saved') return;

  const exists = appState.dms.some((d) => d.username === username);
  if (!exists) {
    appState.dms = [{ username, unread: 0 }, ...appState.dms];

    if (!appState.profileCache[username]) {
      try {
        const p = await api.profile.getUser(username);
        if (p) appState.profileCache[username] = p;
      } catch (e) {}
    }
  }

  appState.activeServerId = null;
  appState.currentChat = username;
}

export async function loadServerData(serverId) {
  if (!serverId) return;
  try {
    const data = await api.servers.getChannels(serverId);
    appState.serverChannels[serverId] = Array.isArray(data?.channels) ? data.channels : [];
    appState.serverGroups[serverId] = Array.isArray(data?.groups) ? data.groups : [];
  } catch (e) {
    console.error('[chat] Failed to load server data:', e);
  }
}
