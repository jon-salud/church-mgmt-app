'use client';

import * as React from 'react';
import { Button as FlowbiteButton } from 'flowbite-react';
import type { ButtonProps as FlowbiteButtonProps } from 'flowbite-react';

// Maintain exact same API as current Button component
type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'outline';
};

export function Button({ className = '', variant = 'default', ...props }: Props) {
  // Map our variants to Flowbite colors
  const colorMap: Record<'default' | 'outline', FlowbiteButtonProps['color']> = {
    default: 'dark',
    outline: 'light',
  };

  // Force white text on dark buttons for visibility in both light and dark themes
  const combinedClassName =
    `${className} ${variant === 'default' ? '[&>span]:!text-white [&>span]:dark:!text-white' : ''}`.trim();

  return (
    <FlowbiteButton
      color={colorMap[variant]}
      className={combinedClassName}
      {...(props as FlowbiteButtonProps)}
    />
  );
}
