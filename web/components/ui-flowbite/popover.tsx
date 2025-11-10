'use client';

import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useClick,
  useDismiss,
  useRole,
  useInteractions,
  type Placement,
} from '@floating-ui/react';
import { type ReactNode, cloneElement, isValidElement, useCallback } from 'react';
import { Portal } from './portal';
import { cn } from '@/lib/utils';

interface PopoverProps {
  /** The trigger element that opens the popover */
  trigger: ReactNode;
  /** The content to display in the popover */
  children: ReactNode;
  /** Controlled open state */
  open?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Placement of the popover relative to trigger */
  placement?: Placement;
  /** Additional CSS classes for the popover panel */
  className?: string;
  /** Whether to use a modal focus manager (traps focus) */
  modal?: boolean;
}

/**
 * Popover component using Floating UI for robust positioning.
 *
 * Features:
 * - Automatic flip/shift when near viewport edges
 * - Portal rendering to escape parent overflow
 * - Focus management and keyboard navigation
 * - Accessible by default (ARIA attributes)
 *
 * @example
 * ```tsx
 * <Popover
 *   trigger={<button>Open</button>}
 *   placement="bottom-start"
 * >
 *   <div>Popover content</div>
 * </Popover>
 * ```
 */
export function Popover({
  trigger,
  children,
  open: controlledOpen,
  onOpenChange,
  placement = 'bottom-start',
  className,
  modal = false,
}: PopoverProps) {
  const { refs, floatingStyles, context } = useFloating({
    open: controlledOpen,
    onOpenChange,
    placement,
    middleware: [
      offset(8),
      flip({
        fallbackAxisSideDirection: 'start',
        padding: 8,
      }),
      shift({ padding: 8 }),
    ],
    whileElementsMounted: autoUpdate,
  });

  const click = useClick(context);

  // Memoize the outsidePress handler to prevent infinite re-renders
  const handleOutsidePress = useCallback((event: MouseEvent) => {
    const target = event.target as HTMLElement;
    // Allow select elements and their interactions
    if (target.tagName === 'SELECT') {
      return false;
    }
    // Check if we're inside a select's dropdown
    const selectParent = target.closest('select');
    if (selectParent) {
      return false;
    }
    return true;
  }, []);

  const dismiss = useDismiss(context, {
    // Don't dismiss when interacting with SELECT elements
    // Their native dropdowns render outside the DOM and can cause false positives
    outsidePress: handleOutsidePress,
  });
  const role = useRole(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

  const isOpen = context.open;

  return (
    <>
      {/* Trigger */}
      {isValidElement(trigger) &&
        cloneElement(trigger, {
          ...getReferenceProps({
            ref: refs.setReference,
            'aria-expanded': isOpen,
            'aria-haspopup': 'dialog',
          }),
        })}

      {/* Popover Panel */}
      {isOpen && (
        <Portal>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
            className={cn(
              'z-50 rounded-lg border border-border bg-background shadow-lg',
              className
            )}
          >
            {children}
          </div>
        </Portal>
      )}
    </>
  );
}
