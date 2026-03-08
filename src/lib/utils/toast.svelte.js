export const toastState = $state({
  toasts: [],
});
let toastId = 0;
export function addToast(title, message, type = 'info', duration = 4000) {
  const id = ++toastId;
  toastState.toasts.push({ id, title, message, type });
  if (duration > 0) {
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }
}
export function toastError(title, message) {
  addToast(title, message, 'error');
}
export function toastSuccess(title, message) {
  addToast(title, message, 'success');
}
export function removeToast(id) {
  toastState.toasts = toastState.toasts.filter((t) => t.id !== id);
}
