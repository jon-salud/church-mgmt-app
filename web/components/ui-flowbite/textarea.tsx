'use client';

import * as React from 'react';
import { Textarea as FlowbiteTextarea } from 'flowbite-react';
import type { TextareaProps } from 'flowbite-react';

// Maintain exact same API as current Textarea component
type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, Props>(
  ({ className = '', ...props }, ref) => {
    return <FlowbiteTextarea ref={ref} className={className} {...(props as TextareaProps)} />;
  }
);

Textarea.displayName = 'Textarea';
