'use client';

import { useState, useCallback } from 'react';

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export interface ConfirmState extends ConfirmOptions {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Hook for managing confirmation dialogs
 *
 * @returns Tuple of [confirm function, dialog state]
 *
 * @example
 * ```tsx
 * const [confirm, confirmState] = useConfirm();
 *
 * const handleDelete = async () => {
 *   const confirmed = await confirm({
 *     title: 'Delete Member',
 *     message: 'Are you sure you want to delete this member?',
 *     variant: 'danger'
 *   });
 *
 *   if (confirmed) {
 *     // Proceed with deletion
 *   }
 * };
 *
 * // Render dialog
 * <ConfirmDialog {...confirmState} />
 * ```
 */
export function useConfirm(): [(options: ConfirmOptions) => Promise<boolean>, ConfirmState] {
  const [state, setState] = useState<ConfirmState>({
    isOpen: false,
    message: '',
    onConfirm: () => {},
    onCancel: () => {},
  });

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise(resolve => {
      setState({
        isOpen: true,
        title: options.title,
        message: options.message,
        confirmText: options.confirmText || 'Confirm',
        cancelText: options.cancelText || 'Cancel',
        variant: options.variant || 'info',
        onConfirm: () => {
          setState(prev => ({ ...prev, isOpen: false }));
          resolve(true);
        },
        onCancel: () => {
          setState(prev => ({ ...prev, isOpen: false }));
          resolve(false);
        },
      });
    });
  }, []);

  return [confirm, state];
}
