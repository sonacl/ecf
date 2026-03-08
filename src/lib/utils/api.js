import { browser } from '$app/environment';
import { appState } from '$lib/state.svelte.js';
import { API_BASE_URL } from '$lib/config.js';
const BASE_URL = API_BASE_URL;
function handleLogout() {
  if (browser) {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
  }
  appState.token = null;
  appState.username = null;
  if (browser) window.location.href = '/login';
}
export async function apiRequest(endpoint, method = 'GET', body = null) {
  if (!browser) return null;
  const headers = { 'Content-Type': 'application/json' };
  if (appState.token) {
    headers['Authorization'] = `Bearer ${appState.token}`;
  }
  const options = {
    method,
    headers,
    cache: 'no-store',
  };
  if (body && !(body instanceof FormData)) {
    options.body = JSON.stringify(body);
  } else if (body instanceof FormData) {
    delete headers['Content-Type'];
    options.body = body;
  }
  let res = await fetch(`${BASE_URL}${endpoint}`, options);
  if (res.status === 401) {
    handleLogout();
    return null;
  }
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || 'API Error');
  }
  return res.json().catch(() => null);
}
export const api = {
  auth: {
    login: async (email, password) => {
      const res = await apiRequest('/enchatted/login', 'POST', { email, password });
      if (res?.token && browser) {
        appState.token = res.token;
        appState.username = res.username;
        localStorage.setItem('token', res.token);
        localStorage.setItem('username', res.username);
      }
      return res;
    },
    register: (data) => apiRequest('/enchatted/register', 'POST', data),
    heartbeat: (device) => apiRequest('/enchatted/heartbeat', 'POST', { device_type: device }),
    poll: () => apiRequest('/enchatted/poll'),
    deactivate: (password) => apiRequest('/enchatted/auth/deactivate', 'POST', { password }),
    logout: () => apiRequest('/enchatted/auth/logout', 'POST', {}).catch(() => {}),
  },
  profile: {
    getMe: () => apiRequest('/enchatted/profile/me'),
    getStats: (username) => apiRequest(`/enchatted/profile/${encodeURIComponent(username)}/stats`),
    getUser: (username) => apiRequest(`/enchatted/profile/${encodeURIComponent(username)}`),
    update: (data) => apiRequest('/enchatted/profile/update', 'POST', data),
    changeUsername: (newUsername) =>
      apiRequest('/enchatted/auth/change-username', 'POST', { new_username: newUsername }),
    changePassword: (oldPw, newPw) =>
      apiRequest('/enchatted/auth/change-password', 'POST', {
        old_password: oldPw,
        new_password: newPw,
      }),
    getCustomStatus: (username) =>
      apiRequest(`/enchatted/profile/custom-status/${encodeURIComponent(username)}`),
    getAvatar: (username) =>
      apiRequest(`/enchatted/profile/avatar/${encodeURIComponent(username)}`),
    getById: (userId) => apiRequest(`/enchatted/profile/by-id/${encodeURIComponent(userId)}`),
  },
  friends: {
    list: () => apiRequest('/enchatted/friends'),
    getRequests: () => apiRequest('/enchatted/friend-requests'),
    getSentRequests: () => apiRequest('/enchatted/friend-requests/sent'),
    add: (to) => apiRequest('/enchatted/friends/request', 'POST', { to }),
    respond: (from, accept) => apiRequest('/enchatted/friends/respond', 'POST', { from, accept }),
    cancel: (to) => apiRequest('/enchatted/friends/cancel', 'POST', { to }),
    remove: (user) => apiRequest('/enchatted/friends/remove', 'POST', { user }),
  },
  messages: {
    get: (user, limit = 50, offset = 0, since = null) => {
      let url = `/enchatted/messages?user=${encodeURIComponent(user)}&limit=${limit}&offset=${offset}`;
      if (since) url += `&since=${encodeURIComponent(since)}`;
      return apiRequest(url);
    },
    send: (to, content) => apiRequest('/enchatted/messages/send', 'POST', { to, content }),
    edit: (id, content) => apiRequest('/enchatted/messages/edit', 'POST', { id, content }),
    delete: (id) => apiRequest('/enchatted/messages/delete', 'POST', { id }),
    react: (id, type) => apiRequest('/enchatted/messages/react', 'POST', { id, type }),
    markSeen: (from) => apiRequest('/enchatted/messages/seen', 'POST', { from }),
    getTyping: (from) => apiRequest(`/enchatted/typing?from=${encodeURIComponent(from)}`),
    sendTyping: (to) => apiRequest('/enchatted/typing', 'POST', { to }),
    getUpdates: (withUser, since) =>
      apiRequest(
        `/enchatted/messages/updates?with=${encodeURIComponent(withUser)}&since=${encodeURIComponent(since)}`,
      ),
  },
  dms: {
    list: () => apiRequest('/enchatted/dms'),
    close: (user) => apiRequest('/enchatted/dms/close', 'POST', { user }),
  },
  groups: {
    list: () => apiRequest('/enchatted/groups'),
    create: (users, name) => apiRequest('/enchatted/groups/create', 'POST', { users, name }),
    send: (id, content) => apiRequest(`/enchatted/groups/${id}/messages/send`, 'POST', { content }),
    edit: (id, mid, content) =>
      apiRequest(`/enchatted/groups/${id}/messages/edit`, 'POST', { id: mid, content }),
    react: (gid, mid, type) =>
      apiRequest(`/enchatted/groups/${gid}/messages/react`, 'POST', { id: mid, type }),
    markSeen: (id) => apiRequest(`/enchatted/groups/${id}/seen`, 'POST', {}),
    leave: (id) => apiRequest(`/enchatted/groups/${id}/leave`, 'POST', {}),
    get: (id) => apiRequest(`/enchatted/groups/${id}`),
    getMembers: (id) => apiRequest(`/enchatted/groups/${id}/members`),
    getMessages: (id, limit = 50, offset = 0, since = null) => {
      let url = `/enchatted/groups/${id}/messages?limit=${limit}&offset=${offset}`;
      if (since) url += `&since=${encodeURIComponent(since)}`;
      return apiRequest(url);
    },
  },
  servers: {
    list: () => apiRequest('/enchatted/servers'),
    create: (name, description) => apiRequest('/enchatted/servers', 'POST', { name, description }),
    join: (inviteCode) =>
      apiRequest('/enchatted/servers/join', 'POST', { invite_code: inviteCode }),
    update: (id, data) => apiRequest(`/enchatted/servers/${id}`, 'POST', data),
    delete: (id) => apiRequest(`/enchatted/servers/${id}/delete`, 'POST', {}),
    leave: (id) => apiRequest(`/enchatted/servers/${id}/leave`, 'POST', {}),
    getInvite: (id) => apiRequest(`/enchatted/servers/${id}/invite`),
    getChannels: (id) => apiRequest(`/enchatted/servers/${id}/channels`),
    createChannel: (id, name, description) =>
      apiRequest(`/enchatted/servers/${id}/channels`, 'POST', { name, description }),
    getMembers: (id) => apiRequest(`/enchatted/servers/${id}/members`),
    createGroup: (id, name) => apiRequest(`/enchatted/servers/${id}/groups`, 'POST', { name }),
    getChannelMessages: (sid, cid) =>
      apiRequest(`/enchatted/servers/${sid}/channels/${cid}/messages`),
    sendChannelMessage: (sid, cid, content) =>
      apiRequest(`/enchatted/servers/${sid}/channels/${cid}/messages`, 'POST', { content }),
    react: (sid, cid, mid, type) =>
      apiRequest(`/enchatted/servers/${sid}/channels/${cid}/messages/${mid}/react`, 'POST', {
        type,
      }),
    edit: (sid, cid, mid, content) =>
      apiRequest(`/enchatted/servers/${sid}/channels/${cid}/messages/${mid}/edit`, 'POST', {
        content,
      }),
    delete: (sid, cid, mid) =>
      apiRequest(`/enchatted/servers/${sid}/channels/${cid}/messages/${mid}/delete`, 'POST', {}),
  },
  media: {
    getSaved: () => apiRequest('/enchatted/saved-media'),
    save: (url) => apiRequest('/enchatted/saved-media', 'POST', { url }),
    removeSaved: (url) => apiRequest('/enchatted/saved-media', 'DELETE', { url }),
  },
  gifs: {
    trending: () => apiRequest('/enchatted/gifs/trending'),
    search: (query) => apiRequest(`/enchatted/gifs/search?q=${encodeURIComponent(query)}`),
  },
  admin: {
    listUsers: () => apiRequest('/enchatted/api/users'),
    updateUser: (username, data) =>
      apiRequest(`/enchatted/api/users/${encodeURIComponent(username)}`, 'POST', data),
    resetPassword: (username, password) =>
      apiRequest(`/enchatted/api/users/${encodeURIComponent(username)}/reset-password`, 'POST', {
        password,
      }),
    enchant: (username, enchant, level = 1) =>
      apiRequest(`/enchatted/api/users/${encodeURIComponent(username)}/enchant`, 'POST', {
        enchant,
        level,
      }),
    removeEnchant: (username, enchant) =>
      apiRequest(`/enchatted/api/users/${encodeURIComponent(username)}/remove-enchant`, 'POST', {
        enchant,
      }),
    deactivate: (username) =>
      apiRequest(`/enchatted/api/users/${encodeURIComponent(username)}/deactivate`, 'POST', {}),
    reactivate: (username) =>
      apiRequest(`/enchatted/api/users/${encodeURIComponent(username)}/reactivate`, 'POST', {}),
  },
  upload: (formData) => {
    if (!browser) return null;
    const headers = {};
    if (appState.token) headers['Authorization'] = `Bearer ${appState.token}`;
    return fetch(`${BASE_URL}/enchatted/upload`, {
      method: 'POST',
      headers,
      body: formData,
    }).then((r) => r.json());
  },
};
