// true for production, false for development
export const USE_REMOTE_API = false;

export const REMOTE_API_URL = 'https://enchatted.xyz';
export const REMOTE_WS_URL = 'wss://enchatted.xyz';

export const API_BASE_URL = USE_REMOTE_API ? REMOTE_API_URL : '';
export const WS_BASE_URL = USE_REMOTE_API ? REMOTE_WS_URL : '';
