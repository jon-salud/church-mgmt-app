'use client';

import * as React from 'react';
import { Button as FlowbiteButton } from 'flowbite-react';
import type { ButtonProps as FlowbiteButtonProps } from 'flowbite-react';

// Maintain exact same API as current Button component
type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'outline';
};

export function Button({ className = '', variant = 'default', ...props }: Props) {
  // Map our variants to Flowbite colors - use Flowbite's standard styling
  const colorMap: Record<'default' | 'outline', FlowbiteButtonProps['color']> = {
    default: 'light',
    outline: 'light',
  };

  // Add proper padding and styling
  const baseClasses = 'px-4 py-2';

  return (
    <FlowbiteButton
      color={colorMap[variant]}
      className={`${baseClasses} ${className}`}
      {...(props as FlowbiteButtonProps)}
    />
  );
}
