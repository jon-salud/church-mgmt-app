'use client';

import * as React from 'react';
import { Checkbox as FlowbiteCheckbox } from 'flowbite-react';
import type { CheckboxProps as FlowbiteCheckboxProps } from 'flowbite-react';
import { cn } from '@/lib/utils';

// Maintain exact same API as current Checkbox component
// Radix uses data-[state=checked] but we need to handle checked prop
interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onCheckedChange) {
        onCheckedChange(e.target.checked);
      }
      if (onChange) {
        onChange(e);
      }
    };

    return (
      <FlowbiteCheckbox
        ref={ref}
        className={cn(
          'peer h-4 w-4 shrink-0 rounded-sm border border-slate-200 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-slate-900 data-[state=checked]:text-slate-50 dark:border-slate-800 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300 dark:data-[state=checked]:bg-slate-50 dark:data-[state=checked]:text-slate-900',
          className
        )}
        checked={checked}
        onChange={handleChange}
        {...(props as FlowbiteCheckboxProps)}
      />
    );
  }
);
Checkbox.displayName = 'Checkbox';

export { Checkbox };
