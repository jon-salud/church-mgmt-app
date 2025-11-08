'use client';

import { create } from 'zustand';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  title?: string;
  duration?: number;
  closable?: boolean;
  action?: ToastAction;
}

export interface ToastOptions {
  title?: string;
  duration?: number;
  closable?: boolean;
  action?: ToastAction;
  maxToasts?: number;
}

type TimeoutId = ReturnType<typeof setTimeout>;

interface ToastStore {
  toasts: Toast[];
  timers: Map<string, TimeoutId>;
  add: (toast: Omit<Toast, 'id'>, options?: ToastOptions) => string;
  dismiss: (id?: string) => void;
}

const DEFAULT_DURATION = 3000;
const DEFAULT_MAX_TOASTS = 3;

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],
  timers: new Map(),

  add: (toast, options) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const maxToasts = options?.maxToasts ?? DEFAULT_MAX_TOASTS;
    const duration = options?.duration ?? DEFAULT_DURATION;

    set(state => {
      // Remove oldest toast if exceeding maxToasts
      const newToasts = [...state.toasts, { ...toast, id }];
      if (newToasts.length > maxToasts) {
        const removedToast = newToasts.shift();
        if (removedToast) {
          const timer = state.timers.get(removedToast.id);
          if (timer) clearTimeout(timer);
          state.timers.delete(removedToast.id);
        }
      }

      return { toasts: newToasts };
    });

    // Set up auto-dismiss timer
    if (duration > 0) {
      const timer = setTimeout(() => {
        get().dismiss(id);
      }, duration);
      get().timers.set(id, timer);
    }

    return id;
  },

  dismiss: id => {
    set(state => {
      if (!id) {
        // Clear all timers
        state.timers.forEach(timer => clearTimeout(timer));
        return { toasts: [], timers: new Map() };
      }

      // Clear specific timer
      const timer = state.timers.get(id);
      if (timer) {
        clearTimeout(timer);
        state.timers.delete(id);
      }

      return {
        toasts: state.toasts.filter(t => t.id !== id),
      };
    });
  },
}));

export interface UseToastReturn {
  toasts: Toast[];
  success: (message: string, options?: ToastOptions) => string;
  error: (message: string, options?: ToastOptions) => string;
  info: (message: string, options?: ToastOptions) => string;
  warning: (message: string, options?: ToastOptions) => string;
  dismiss: (id?: string) => void;
}

export function useToast(): UseToastReturn {
  const { toasts, add, dismiss } = useToastStore();

  const success = (message: string, options?: ToastOptions) =>
    add({ message, variant: 'success', ...options }, options);

  const error = (message: string, options?: ToastOptions) =>
    add({ message, variant: 'error', ...options }, options);

  const info = (message: string, options?: ToastOptions) =>
    add({ message, variant: 'info', ...options }, options);

  const warning = (message: string, options?: ToastOptions) =>
    add({ message, variant: 'warning', ...options }, options);

  return {
    toasts,
    success,
    error,
    info,
    warning,
    dismiss,
  };
}
