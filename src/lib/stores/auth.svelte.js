import { browser } from '$app/environment';

export const authStore = $state({
  user: null,
  token: browser ? localStorage.getItem('token') : null,
  username: browser ? localStorage.getItem('username') : null,
});

export function setAuth(token, username, user = null) {
  if (browser) {
    localStorage.setItem('token', token);
    localStorage.setItem('username', username);
  }
  authStore.token = token;
  authStore.username = username;
  authStore.user = user;
}

export function clearAuth() {
  if (browser) {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
  }
  authStore.token = null;
  authStore.username = null;
  authStore.user = null;
}

export function updateUser(user) {
  authStore.user = user;
}
