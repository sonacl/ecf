import { browser } from '$app/environment';
import { appState } from '$lib/state.svelte.js';
export function updateTabTitle() {
  if (!browser) return;
  const total = Object.values(appState.unreadMessages).reduce((a, b) => a + (b || 0), 0);
  document.title = total > 0 ? `(${total > 99 ? '99+' : total}) Enchatted` : 'Enchatted';
}
export function sendBrowserNotification(sender, msgContent) {
  if (!browser || !('Notification' in window) || Notification.permission !== 'granted') return;
  if (document.hasFocus()) return;
  const body = (msgContent || '').slice(0, 100);
  try {
    const n = new Notification(`${sender} sent a message`, {
      body,
      icon: '/favicon.ico',
      tag: `enchatted-dm-${sender}`,
    });
    setTimeout(() => n.close(), 5000);
    n.onclick = () => {
      window.focus();
      n.close();
    };
  } catch (e) {
    console.error('[Notification] Error:', e);
  }
}
export function requestNotificationPermission() {
  if (browser && 'Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission().catch(() => {});
  }
}
export function initFontPreloader() {
  if (!browser || document.getElementById('_encFontPreloader')) return;
  const el = document.createElement('div');
  el.id = '_encFontPreloader';
  el.setAttribute('aria-hidden', 'true');
  el.style.cssText =
    'position:absolute;left:-9999px;top:-9999px;visibility:hidden;pointer-events:none;font-size:1px;';
  el.innerHTML =
    '<span style="font-family:\'EncPixel\',monospace;">.</span>' +
    '<span style="font-family:\'EncComic\',cursive;">.</span>' +
    '<span style="font-family:\'EncTypewriter\',monospace;">.</span>' +
    '<span style="font-family:\'EncDigital\',monospace;">.</span>' +
    '<span style="font-family:\'EncBold\',sans-serif;">.</span>';
  (document.body || document.documentElement).appendChild(el);
}
export function parseMessageContent(content) {
  if (!content) return { text: '', reply: null };
  const replyRegex = /^\s*REPLY\s+([^\s]+)\s+([^\s]+)\s+([\s\S]*?)\s+RESPONSE(?:\s+(.*))?$/;
  const legacyRegex = /^\s*REPLY\s+([^\s]+)\s+([\s\S]*?)\s+RESPONSE(?:\s+(.*))?$/;
  const lines = content.split('\n');
  const header = (lines.shift() || '').trim();
  const rest = lines.join('\n');
  let match = header.match(replyRegex);
  if (match) {
    let replySender = match[1];
    let replyId = match[2];
    let replyPreview = match[3] || '';
    let inlineBody = match[4] || '';
    try {
      replyPreview = decodeURIComponent(escape(atob(replyPreview)));
    } catch (e1) {
      try {
        replyPreview = decodeURIComponent(replyPreview);
      } catch (e2) {}
    }
    return {
      text: inlineBody + (rest ? '\n' + rest : ''),
      reply: {
        sender: replySender,
        id: replyId,
        preview: replyPreview,
      },
    };
  }
  match = header.match(legacyRegex);
  if (match) {
    let replySender = match[1];
    let replyPreview = match[2] || '';
    let inlineBody = match[3] || '';
    try {
      replyPreview = decodeURIComponent(escape(atob(replyPreview)));
    } catch (e1) {
      try {
        replyPreview = decodeURIComponent(replyPreview);
      } catch (e2) {}
    }
    return {
      text: inlineBody + (rest ? '\n' + rest : ''),
      reply: {
        sender: replySender,
        preview: replyPreview,
      },
    };
  }
  return { text: content, reply: null };
}
export function getEmbeds(content) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return content.match(urlRegex) || [];
}
export function getMediaType(url) {
  if (/tenor\.com/i.test(url)) return 'tenor';
  if (/\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(url)) return 'image';
  if (/\.(mp4|webm)(\?.*)?$/i.test(url)) return 'video';
  return 'link';
}
export function formatTime(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  } catch (e) {
    return '';
  }
}
export function formatDay(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString([], {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (e) {
    return '';
  }
}
export function groupMessages(messages) {
  if (!messages.length) return [];
  const grouped = [];
  let currentGroup = {
    author: messages[0].author,
    timestamp: messages[0].timestamp,
    items: [messages[0]],
  };
  for (let i = 1; i < messages.length; i++) {
    const msg = messages[i];
    const prev = messages[i - 1];
    const sameAuthor = msg.author.username === prev.author.username;
    const within5Min = new Date(msg.timestamp) - new Date(prev.timestamp) < 300000;
    if (sameAuthor && within5Min) {
      currentGroup.items.push(msg);
    } else {
      grouped.push(currentGroup);
      currentGroup = { author: msg.author, timestamp: msg.timestamp, items: [msg] };
    }
  }
  grouped.push(currentGroup);
  return grouped;
}
