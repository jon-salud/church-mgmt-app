"use client";

import { ReactNode, useEffect, useId } from "react";
import { createPortal } from "react-dom";

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
    document.body.style.overflow = "hidden";
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = original;
      window.removeEventListener("keydown", handler);
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-4 backdrop-blur"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-xl border border-border bg-card shadow-2xl"
        onMouseDown={event => event.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 id={labelledBy} className="text-lg font-semibold text-card-foreground">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-transparent px-3 py-1 text-sm text-muted-foreground transition hover:border-primary hover:text-primary"
          >
            Close
          </button>
        </header>
        <div className="px-6 py-4">
          {children}
        </div>
        {footer ? (
          <footer className="border-t border-border bg-muted px-6 py-3">
            {footer}
          </footer>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
