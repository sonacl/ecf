import { browser } from '$app/environment';
import { appState } from '$lib/state.svelte.js';
import { refreshFriendData } from './chat.js';
import { api } from './api.js';
import { WS_BASE_URL } from '$lib/config.js';

let _ws = null;
let _wsConnected = false;
let _wsReconnectTimer = null;
let _wsReconnectDelay = 2000;
let _wsKeepaliveTimer = null;
let _wsStableTimer = null;
let _wsGaveUp = false;
let _wsEverConnected = false;
const WS_MAX_RECONNECT_DELAY = 60000;

export function wsConnect() {
    if (!browser || _wsGaveUp) return;
    if (_ws && (_ws.readyState === WebSocket.OPEN || _ws.readyState === WebSocket.CONNECTING)) return;

    clearTimeout(_wsReconnectTimer);
    clearTimeout(_wsStableTimer);
    clearInterval(_wsKeepaliveTimer);

    try {
        const token = appState.token;
        if (!token) return;

        const base = WS_BASE_URL || (window.location.protocol === 'https:' ? 'wss://' : 'ws://') + window.location.host;
        const wsUrl = `${base}/enchatted/ws?token=${token}`;

        _ws = new WebSocket(wsUrl);

        _ws.onopen = () => {
            const wasEver = _wsEverConnected;
            _wsConnected = true;
            _wsEverConnected = true;
            _wsStableTimer = setTimeout(() => { _wsReconnectDelay = 2000; }, 30000);

            _wsKeepaliveTimer = setInterval(() => {
                if (_ws && _ws.readyState === WebSocket.OPEN) {
                    try { _ws.send(JSON.stringify({ type: 'ping' })); } catch (e) { }
                }
            }, 20000);

            if (wasEver) {
                console.log('[WS] Connection restored');
            }
        };

        _ws.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data);
                if (msg && msg.type === 'pong') return;
                _handleWsMessage(msg);
            } catch (e) {
                console.error('[WS] Parse Error:', e);
            }
        };

        _ws.onclose = (evt) => {
            const hadConnection = _wsConnected;
            _wsConnected = false;
            _ws = null;
            clearInterval(_wsKeepaliveTimer);
            clearTimeout(_wsStableTimer);

            if (evt.code === 4001) {
                _wsGaveUp = true;
                console.warn('[WS] Auth rejected');
                return;
            }

            if (evt.code === 4000) {
                console.warn('[WS] Socket replaced');
                return;
            }

            if (hadConnection && _wsEverConnected) {
                console.log('[WS] Connection lost');
            }

            _wsReconnectTimer = setTimeout(() => wsConnect(), _wsReconnectDelay);
            _wsReconnectDelay = Math.min(_wsReconnectDelay * 2, WS_MAX_RECONNECT_DELAY);
        };

        _ws.onerror = (err) => {
            console.error('[WS] Error:', err);
        };
    } catch (e) {
        console.error('[WS] Setup Error:', e);
        _wsConnected = false;
        _wsGaveUp = true;
    }
}

function _handleWsMessage(msg) {
    if (!msg || !msg.type) return;

    const handlers = {
        'new_message': () => handleNewMessage(msg),
        'message_edit': () => handleMessageEdit(msg),
        'message_delete': () => handleMessageDelete(msg),
        'reaction': () => handleReaction(msg),
        'typing': () => handleTyping(msg),
        'presence': () => handlePresence(msg),
        'friend_request': () => handleFriendRequest(msg),
        'group_message': () => handleGroupMessage(msg),
        'group_message_edit': () => handleGroupMessageEdit(msg),
        'group_message_delete': () => handleGroupMessageDelete(msg),
        'group_reaction': () => handleGroupReaction(msg),
        'notification': () => console.log('[WS] Notification:', msg)
    };

    if (handlers[msg.type]) {
        handlers[msg.type]();
    }
}

async function ensureProfileInCache(username) {
    if (!username || appState.profileCache[username] || username === appState.username) return;
    try {
        const u = await api.profile.getUser(username);
        if (u) appState.profileCache[username] = u;
    } catch (e) {
        console.error('[WS] Failed to fetch profile for', username, e);
    }
}

function handleNewMessage(msg) {
    const m = msg.message;
    if (!m) return;

    ensureProfileInCache(m.sender);

    let targetId;
    if (m.channel_id) {
        targetId = `channel:${m.channel_id}`;
    } else {
        targetId = m.sender === appState.username ? m.receiver : m.sender;
    }

    if (appState.currentChat === targetId) {
        const id = m.id || m._id || Date.now();
        if (!appState.messages.find((msg) => msg.id === id)) {
            appState.messages = [
                ...appState.messages,
                {
                    id,
                    author: {
                        username: m.sender,
                        display_name: m.display_name,
                        profile_picture: m.pfp,
                    },
                    content: m.content || "",
                    timestamp: m.created_at || new Date().toISOString(),
                    reactions: {},
                    attachments: m.attachments || [],
                    reply_to: m.reply_to || null,
                },
            ];
        }
    }

    if (appState.currentChat !== targetId && m.sender !== appState.username) {
        appState.unreadMessages[targetId] = (appState.unreadMessages[targetId] || 0) + 1;
    }

    if (!m.channel_id) {
        try {
            const ts = m.created_at ? new Date(m.created_at).getTime() : Date.now();
            appState.friendLastMsg[targetId] = new Date(ts).toISOString();
        } catch (e) { }
    }
}

function handleMessageEdit(msg) {
    const mid = msg.message_id || msg.id;
    appState.messages = appState.messages.map(m =>
        m.id === mid ? { ...m, content: msg.content } : m
    );
}

function handleMessageDelete(msg) {
    const mid = msg.message_id || msg.id;
    appState.messages = appState.messages.filter(m => m.id !== mid);
}

function handleReaction(msg) {
    const mid = msg.message_id;
    if (!appState.messageReactions[mid]) appState.messageReactions[mid] = {};
    const reacts = appState.messageReactions[mid];

    reacts[msg.reactionType] ??= [];

    if (msg.action === 'add') {
        if (!reacts[msg.reactionType].includes(msg.username)) {
            reacts[msg.reactionType].push(msg.username);
        }
    } else {
        reacts[msg.reactionType] = reacts[msg.reactionType].filter(u => u !== msg.username);
        if (reacts[msg.reactionType].length === 0) delete reacts[msg.reactionType];
    }
}

function handleTyping(msg) {
    appState.isTyping[msg.from] = true;
    setTimeout(() => {
        appState.isTyping[msg.from] = false;
    }, 4000);
}

function handlePresence(msg) {
    if (msg.online) {
        appState.onlineUsers.add(msg.username);
    } else {
        appState.onlineUsers.delete(msg.username);
    }

    if (!appState.statusCache[msg.username]) {
        appState.statusCache[msg.username] = {};
    }
    appState.statusCache[msg.username].device_type = msg.device_type;
}

function handleFriendRequest(msg) {
    refreshFriendData();
}

function handleGroupMessage(msg) {
    const m = msg.message;
    if (!m) return;

    ensureProfileInCache(m.sender);

    const gid = m.group_id;
    const targetId = `group:${gid}`;

    if (appState.currentChat === targetId) {
        appState.messages = [...appState.messages, {
            id: m.id || m._id || Date.now(),
            author: {
                username: m.sender,
                display_name: m.display_name,
                profile_picture: m.pfp
            },
            content: m.content || "",
            timestamp: m.created_at || new Date().toISOString(),
            reactions: {},
            attachments: m.attachments || [],
            reply_to: m.reply_to || null
        }];
    } else {
        appState.unreadMessages[targetId] = (appState.unreadMessages[targetId] || 0) + 1;
    }
}

function handleGroupMessageEdit(msg) {
    handleMessageEdit(msg);
}

function handleGroupMessageDelete(msg) {
    handleMessageDelete(msg);
}

function handleGroupReaction(msg) {
    handleReaction(msg);
}
