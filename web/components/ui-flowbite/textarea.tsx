'use client';

import * as React from 'react';
import { Textarea as FlowbiteTextarea } from 'flowbite-react';
import type { TextareaProps } from 'flowbite-react';
import { cn } from '@/lib/utils';

/**
 * Enhanced Textarea component matching Input focus states and error handling.
 * Supports error state via className for consistent form validation UX.
 */
type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  error?: boolean;
};

export const Textarea = React.forwardRef<HTMLTextAreaElement, Props>(
  ({ className = '', error = false, ...props }, ref) => {
    const errorStyles = error
      ? 'border-destructive focus:border-destructive focus:ring-destructive'
      : '';

    return (
      <FlowbiteTextarea
        ref={ref}
        color={error ? 'failure' : undefined}
        className={cn(errorStyles, className)}
        {...(props as TextareaProps)}
      />
    );
  }
);

Textarea.displayName = 'Textarea';
