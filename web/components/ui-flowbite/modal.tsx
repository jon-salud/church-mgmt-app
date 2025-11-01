'use client';

import { ReactNode, useEffect, useId } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

// Maintain exact same API as current Modal component
type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function Modal({ open, onClose, title, children, footer }: ModalProps) {
  const labelledBy = useId();

  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => {
      document.body.style.overflow = original;
      window.removeEventListener('keydown', handler);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return createPortal(
    <div
      aria-modal="true"
      role="dialog"
      aria-labelledby={labelledBy}
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 dark:bg-gray-900/80 px-4 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <div
        className={cn(
          'w-full max-w-2xl overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700',
          'bg-white dark:bg-gray-800 shadow-xl'
        )}
        onMouseDown={event => event.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <h2 id={labelledBy} className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg text-sm p-1.5 ml-auto inline-flex items-center text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white"
          >
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              ></path>
            </svg>
            <span className="sr-only">Close</span>
          </button>
        </header>
        <div className="px-6 py-4 space-y-6">{children}</div>
        {footer ? (
          <footer className="flex items-center space-x-2 border-t border-gray-200 dark:border-gray-700 px-6 py-4 bg-gray-50 dark:bg-gray-700">
            {footer}
          </footer>
        ) : null}
      </div>
    </div>,
    document.body
  );
}
