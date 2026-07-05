/**
 * Custom hook for showing toast notifications
 * Provides success, error, and info toast messages
 */

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number; // milliseconds, default 3000
}

let toastId = 0;
const listeners: Set<(toast: Toast) => void> = new Set();

export const useToast = () => {
  const showToast = (message: string, type: ToastType = 'info', duration = 3000) => {
    const id = `toast-${++toastId}`;
    const toast: Toast = { id, message, type, duration };
    
    // Notify all listeners
    listeners.forEach(listener => listener(toast));
    
    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    
    return id;
  };

  const showSuccess = (message: string, duration = 3000) => {
    return showToast(message, 'success', duration);
  };

  const showError = (message: string, duration = 4000) => {
    return showToast(message, 'error', duration);
  };

  const showInfo = (message: string, duration = 3000) => {
    return showToast(message, 'info', duration);
  };

  const showWarning = (message: string, duration = 3500) => {
    return showToast(message, 'warning', duration);
  };

  return {
    showToast,
    showSuccess,
    showError,
    showInfo,
    showWarning,
  };
};

export const removeToast = (id: string) => {
  // Notify listeners to remove the toast
  listeners.forEach(listener => listener({ id, message: '', type: 'info' }));
};

export const onToastChange = (callback: (toast: Toast) => void) => {
  listeners.add(callback);
  return () => listeners.delete(callback);
};
