'use client';

import * as React from 'react';
import { TextInput } from 'flowbite-react';
import type { TextInputProps } from 'flowbite-react';

/**
 * Enhanced Input component with error state support.
 * Uses Flowbite's color='failure' prop for error styling (red borders and focus rings).
 */
type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  error?: boolean;
};

export const Input = React.forwardRef<HTMLInputElement, Props>(
  ({ className = '', error = false, ...props }, ref) => {
    return (
      <TextInput
        ref={ref}
        color={error ? 'failure' : undefined}
        className={className}
        {...(props as TextInputProps)}
      />
    );
  }
);

Input.displayName = 'Input';
