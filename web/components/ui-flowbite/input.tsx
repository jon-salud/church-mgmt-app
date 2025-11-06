'use client';

import * as React from 'react';
import { TextInput } from 'flowbite-react';
import type { TextInputProps } from 'flowbite-react';
import { cn } from '@/lib/utils';

/**
 * Enhanced Input component with refined focus states using design tokens.
 * Supports error state via className for consistent form validation UX.
 */
type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  error?: boolean;
};

export const Input = React.forwardRef<HTMLInputElement, Props>(
  ({ className = '', error = false, ...props }, ref) => {
    const errorStyles = error
      ? 'border-destructive focus:border-destructive focus:ring-destructive'
      : '';

    return (
      <TextInput
        ref={ref}
        color={error ? 'failure' : undefined}
        className={cn(errorStyles, className)}
        {...(props as TextInputProps)}
      />
    );
  }
);

Input.displayName = 'Input';
