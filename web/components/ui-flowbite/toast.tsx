'use client';

import { HiCheckCircle, HiXCircle, HiInformationCircle, HiExclamation, HiX } from 'react-icons/hi';
import { cn } from '@/lib/utils';
import type { Toast as ToastType } from '@/lib/hooks/use-toast';

const variantStyles = {
  success: {
    container: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    icon: 'text-green-500 dark:text-green-400',
    IconComponent: HiCheckCircle,
  },
  error: {
    container: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    icon: 'text-red-500 dark:text-red-400',
    IconComponent: HiXCircle,
  },
  info: {
    container: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    icon: 'text-blue-500 dark:text-blue-400',
    IconComponent: HiInformationCircle,
  },
  warning: {
    container: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
    icon: 'text-yellow-500 dark:text-yellow-400',
    IconComponent: HiExclamation,
  },
};

interface ToastProps {
  toast: ToastType;
  onDismiss: () => void;
}

export function Toast({ toast, onDismiss }: ToastProps) {
  const variant = variantStyles[toast.variant];
  const IconComponent = variant.IconComponent;
  const closable = toast.closable ?? true;

  return (
    <div
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg border shadow-lg',
        'min-w-[320px] max-w-md',
        'animate-in slide-in-from-top-2 fade-in-0 duration-300',
        'data-[closing=true]:animate-out data-[closing=true]:slide-out-to-top-2 data-[closing=true]:fade-out-0',
        variant.container
      )}
    >
      <IconComponent className={cn('w-5 h-5 flex-shrink-0 mt-0.5', variant.icon)} />

      <div className="flex-1 min-w-0">
        {toast.title && (
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
            {toast.title}
          </h3>
        )}
        <p className="text-sm text-gray-700 dark:text-gray-300">{toast.message}</p>

        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className={cn(
              'mt-2 text-sm font-medium underline hover:no-underline',
              toast.variant === 'success' && 'text-green-700 dark:text-green-400',
              toast.variant === 'error' && 'text-red-700 dark:text-red-400',
              toast.variant === 'info' && 'text-blue-700 dark:text-blue-400',
              toast.variant === 'warning' && 'text-yellow-700 dark:text-yellow-400'
            )}
          >
            {toast.action.label}
          </button>
        )}
      </div>

      {closable && (
        <button
          onClick={onDismiss}
          className={cn(
            'flex-shrink-0 p-1 rounded hover:bg-black/5 dark:hover:bg-white/10',
            'transition-colors'
          )}
          aria-label="Close notification"
        >
          <HiX className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </button>
      )}
    </div>
  );
}
