export const uiStore = $state({
  initialLoading: true,
  pendingReply: null,
  editingMessage: null,
  isSending: false,
  viewingProfile: null,
  isUploading: false,
  pendingFileUrl: null,
  sidebarOpen: true,
  mobileSidebarOpen: false,
});

export function setPendingReply(reply) {
  uiStore.pendingReply = reply;
}

export function clearPendingReply() {
  uiStore.pendingReply = null;
}

export function setEditingMessage(message) {
  uiStore.editingMessage = message;
}

export function clearEditingMessage() {
  uiStore.editingMessage = null;
}

export function setSending(isSending) {
  uiStore.isSending = isSending;
}

export function setViewingProfile(profile) {
  uiStore.viewingProfile = profile;
}

export function setUploading(isUploading) {
  uiStore.isUploading = isUploading;
}

export function setPendingFileUrl(url) {
  uiStore.pendingFileUrl = url;
}

export function toggleSidebar() {
  uiStore.sidebarOpen = !uiStore.sidebarOpen;
}

export function toggleMobileSidebar() {
  uiStore.mobileSidebarOpen = !uiStore.mobileSidebarOpen;
}

export function setInitialLoading(loading) {
  uiStore.initialLoading = loading;
}
