'use client';

import * as React from 'react';
import { Button as FlowbiteButton } from 'flowbite-react';
import type { ButtonProps as FlowbiteButtonProps } from 'flowbite-react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'default' | 'primary' | 'outline' | 'secondary' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'default' | 'lg';

interface Props extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'color' | 'size'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

/**
 * Enhanced Button component wrapping Flowbite React Button.
 *
 * Supports 6 semantic variants:
 * - `default`: Neutral primary action (gray)
 * - `primary`: Theme-aware primary action (uses CSS variables)
 * - `outline`: Secondary outlined action (light + outline)
 * - `secondary`: Lighter secondary action (light)
 * - `ghost`: Transparent background, visible on hover (light + custom styles)
 * - `destructive`: Danger/delete actions (red)
 *
 * Supports 3 sizes:
 * - `sm`: Small (36px height)
 * - `default`: Default (40px height)
 * - `lg`: Large (44px height)
 *
 * @see docs/sprints/ui-enhancement-phase0-RESEARCH.md for API validation
 */
export function Button({ variant = 'default', size = 'default', className = '', ...props }: Props) {
  // Map design system variants to Flowbite's color system
  const colorMap: Record<ButtonVariant, FlowbiteButtonProps['color']> = {
    default: 'gray',
    primary: 'blue', // Will be overridden by custom styles
    outline: 'light',
    secondary: 'light',
    ghost: 'light',
    destructive: 'red',
  };

  // Map design system sizes to Flowbite's size system
  const sizeMap: Record<ButtonSize, FlowbiteButtonProps['size'] | undefined> = {
    sm: 'sm',
    default: undefined, // Flowbite's default size matches our default
    lg: 'lg',
  };

  // Primary variant uses CSS variables for theming
  const primaryStyles =
    variant === 'primary'
      ? '!bg-primary !text-primary-foreground hover:!bg-primary/90 focus:!ring-primary'
      : '';

  // Ghost variant requires transparent background + hover states
  const ghostStyles =
    variant === 'ghost' ? 'bg-transparent hover:bg-accent hover:text-accent-foreground' : '';

  // Outline variant uses Flowbite's outline prop
  const outline = variant === 'outline';

  return (
    <FlowbiteButton
      color={colorMap[variant]}
      size={sizeMap[size]}
      outline={outline}
      className={cn(primaryStyles, ghostStyles, className)}
      {...(props as FlowbiteButtonProps)}
    />
  );
}
