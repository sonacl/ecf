export const serversStore = $state({
  servers: [],
  serverGroups: {},
  serverChannels: {},
  serverGroupChannels: {},
  serverMembers: {},
  activeServerId: null,
});

export function setActiveServer(serverId) {
  serversStore.activeServerId = serverId;
}

export function addServer(server) {
  serversStore.servers = [...serversStore.servers, server];
}

export function removeServer(serverId) {
  serversStore.servers = serversStore.servers.filter((s) => s.id !== serverId);
  delete serversStore.serverChannels[serverId];
  delete serversStore.serverGroups[serverId];
  delete serversStore.serverMembers[serverId];
}

export function setServerChannels(serverId, channels) {
  serversStore.serverChannels[serverId] = channels;
}

export function setServerGroups(serverId, groups) {
  serversStore.serverGroups[serverId] = groups;
}

export function setServerMembers(serverId, members) {
  serversStore.serverMembers[serverId] = members;
}

export function updateServer(serverId, updates) {
  serversStore.servers = serversStore.servers.map((s) =>
    s.id === serverId ? { ...s, ...updates } : s,
  );
}
