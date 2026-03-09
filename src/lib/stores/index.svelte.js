export { authStore, setAuth, clearAuth, updateUser } from './auth.svelte.js';
export { chatStore, addMessage, updateMessage, removeMessage, clearMessages, setCurrentChat, addUnread, clearUnread, addToProfileCache, setOnlineUser, addRecentEmoji } from './chat.svelte.js';
export { serversStore, setActiveServer, addServer, removeServer, setServerChannels, setServerGroups, setServerMembers, updateServer } from './servers.svelte.js';
export { uiStore, setPendingReply, clearPendingReply, setEditingMessage, clearEditingMessage, setSending, setViewingProfile, setUploading, setPendingFileUrl, toggleSidebar, toggleMobileSidebar, setInitialLoading } from './ui.svelte.js';

import { authStore } from './auth.svelte.js';
import { chatStore } from './chat.svelte.js';
import { serversStore } from './servers.svelte.js';
import { uiStore } from './ui.svelte.js';

export const appState = $state({
  get user() { return authStore.user; },
  set user(v) { authStore.user = v; },
  get token() { return authStore.token; },
  set token(v) { authStore.token = v; },
  get username() { return authStore.username; },
  set username(v) { authStore.username = v; },
  
  get friends() { return chatStore.friends; },
  set friends(v) { chatStore.friends = v; },
  get dms() { return chatStore.dms; },
  set dms(v) { chatStore.dms = v; },
  get groups() { return chatStore.groups; },
  set groups(v) { chatStore.groups = v; },
  get requests() { return chatStore.requests; },
  set requests(v) { chatStore.requests = v; },
  get sentRequests() { return chatStore.sentRequests; },
  set sentRequests(v) { chatStore.sentRequests = v; },
  get offlineFriends() { return chatStore.offlineFriends; },
  set offlineFriends(v) { chatStore.offlineFriends = v; },
  get profileCache() { return chatStore.profileCache; },
  set profileCache(v) { chatStore.profileCache = v; },
  get statusCache() { return chatStore.statusCache; },
  set statusCache(v) { chatStore.statusCache = v; },
  get savedMedia() { return chatStore.savedMedia; },
  set savedMedia(v) { chatStore.savedMedia = v; },
  get unreadMessages() { return chatStore.unreadMessages; },
  set unreadMessages(v) { chatStore.unreadMessages = v; },
  get friendLastMsg() { return chatStore.friendLastMsg; },
  set friendLastMsg(v) { chatStore.friendLastMsg = v; },
  get messages() { return chatStore.messages; },
  set messages(v) { chatStore.messages = v; },
  get currentChat() { return chatStore.currentChat; },
  set currentChat(v) { chatStore.currentChat = v; },
  get messageReactions() { return chatStore.messageReactions; },
  set messageReactions(v) { chatStore.messageReactions = v; },
  get onlineUsers() { return chatStore.onlineUsers; },
  set onlineUsers(v) { chatStore.onlineUsers = v; },
  get isTyping() { return chatStore.isTyping; },
  set isTyping(v) { chatStore.isTyping = v; },
  get hiddenDms() { return chatStore.hiddenDms; },
  set hiddenDms(v) { chatStore.hiddenDms = v; },
  get recentlyUsedEmojis() { return chatStore.recentlyUsedEmojis; },
  set recentlyUsedEmojis(v) { chatStore.recentlyUsedEmojis = v; },
  
  get servers() { return serversStore.servers; },
  set servers(v) { serversStore.servers = v; },
  get serverGroups() { return serversStore.serverGroups; },
  set serverGroups(v) { serversStore.serverGroups = v; },
  get serverChannels() { return serversStore.serverChannels; },
  set serverChannels(v) { serversStore.serverChannels = v; },
  get serverGroupChannels() { return serversStore.serverGroupChannels; },
  set serverGroupChannels(v) { serversStore.serverGroupChannels = v; },
  get serverMembers() { return serversStore.serverMembers; },
  set serverMembers(v) { serversStore.serverMembers = v; },
  get activeServerId() { return serversStore.activeServerId; },
  set activeServerId(v) { serversStore.activeServerId = v; },
});

export const uiState = $state({
  get initialLoading() { return uiStore.initialLoading; },
  set initialLoading(v) { uiStore.initialLoading = v; },
  get pendingReply() { return uiStore.pendingReply; },
  set pendingReply(v) { uiStore.pendingReply = v; },
  get editingMessage() { return uiStore.editingMessage; },
  set editingMessage(v) { uiStore.editingMessage = v; },
  get isSending() { return uiStore.isSending; },
  set isSending(v) { uiStore.isSending = v; },
  get viewingProfile() { return uiStore.viewingProfile; },
  set viewingProfile(v) { uiStore.viewingProfile = v; },
  get isUploading() { return uiStore.isUploading; },
  set isUploading(v) { uiStore.isUploading = v; },
  get pendingFileUrl() { return uiStore.pendingFileUrl; },
  set pendingFileUrl(v) { uiStore.pendingFileUrl = v; },
  get sidebarOpen() { return uiStore.sidebarOpen; },
  set sidebarOpen(v) { uiStore.sidebarOpen = v; },
  get mobileSidebarOpen() { return uiStore.mobileSidebarOpen; },
  set mobileSidebarOpen(v) { uiStore.mobileSidebarOpen = v; },
});
