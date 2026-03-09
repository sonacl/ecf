import { browser } from '$app/environment';

export const chatStore = $state({
  friends: [],
  dms: [],
  groups: [],
  requests: [],
  sentRequests: [],
  offlineFriends: [],
  profileCache: {},
  statusCache: {},
  savedMedia: [],
  unreadMessages: {},
  friendLastMsg: {},
  messages: [],
  currentChat: null,
  messageReactions: {},
  onlineUsers: new Set(),
  isTyping: {},
  hiddenDms: new Set(),
  recentlyUsedEmojis: browser ? JSON.parse(localStorage.getItem('recentEmojis') || '[]') : [],
});

export function addMessage(message) {
  chatStore.messages = [...chatStore.messages, message];
}

export function updateMessage(messageId, updates) {
  chatStore.messages = chatStore.messages.map((m) =>
    m.id === messageId ? { ...m, ...updates } : m,
  );
}

export function removeMessage(messageId) {
  chatStore.messages = chatStore.messages.filter((m) => m.id !== messageId);
}

export function clearMessages() {
  chatStore.messages = [];
}

export function setCurrentChat(chat) {
  chatStore.currentChat = chat;
}

export function addUnread(target, count = 1) {
  chatStore.unreadMessages[target] = (chatStore.unreadMessages[target] || 0) + count;
}

export function clearUnread(target) {
  chatStore.unreadMessages[target] = 0;
}

export function addToProfileCache(username, profile) {
  chatStore.profileCache[username] = profile;
}

export function setOnlineUser(username, isOnline) {
  if (isOnline) {
    chatStore.onlineUsers.add(username);
  } else {
    chatStore.onlineUsers.delete(username);
  }
}

export function addRecentEmoji(emoji) {
  const emojis = chatStore.recentlyUsedEmojis;
  const filtered = emojis.filter((e) => e !== emoji);
  chatStore.recentlyUsedEmojis = [emoji, ...filtered].slice(0, 32);
  if (browser) {
    localStorage.setItem('recentEmojis', JSON.stringify(chatStore.recentlyUsedEmojis));
  }
}
