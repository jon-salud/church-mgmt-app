'use client';

import * as React from 'react';
import { TextInput } from 'flowbite-react';
import type { TextInputProps } from 'flowbite-react';

// Maintain exact same API as current Input component
type Props = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, Props>(
  ({ className = '', ...props }, ref) => {
    return <TextInput ref={ref} className={className} {...(props as TextInputProps)} />;
  }
);

Input.displayName = 'Input';
