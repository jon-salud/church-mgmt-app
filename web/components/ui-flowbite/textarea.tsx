'use client';

import * as React from 'react';
import { Textarea as FlowbiteTextarea } from 'flowbite-react';
import type { TextareaProps } from 'flowbite-react';

/**
 * Enhanced Textarea component with error state support matching Input behavior.
 * Uses Flowbite's color='failure' prop for error styling (red borders and focus rings).
 */
type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  error?: boolean;
};

export const Textarea = React.forwardRef<HTMLTextAreaElement, Props>(
  ({ className = '', error = false, ...props }, ref) => {
    return (
      <FlowbiteTextarea
        ref={ref}
        color={error ? 'failure' : undefined}
        className={className}
        {...(props as TextareaProps)}
      />
    );
  }
);

Textarea.displayName = 'Textarea';
