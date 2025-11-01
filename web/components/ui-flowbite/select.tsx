'use client';

import * as React from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

// Maintain exact same compound component API as current Select component
// This is a complex wrapper to maintain Radix-style API

interface SelectContextValue {
  value?: string;
  onValueChange?: (value: string) => void;
}

const SelectContext = React.createContext<SelectContextValue>({});

// Main Select component (Root)
interface SelectProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  children: React.ReactNode;
}

const Select: React.FC<SelectProps> = ({ value, defaultValue, onValueChange, name, children }) => {
  const [internalValue, setInternalValue] = React.useState(
    value !== undefined ? value : defaultValue || ''
  );
  const [hiddenInputValue, setHiddenInputValue] = React.useState(internalValue);

  const handleValueChange = (newValue: string) => {
    setInternalValue(newValue);
    setHiddenInputValue(newValue);
    onValueChange?.(newValue);
  };

  // Sync external value changes
  React.useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
      setHiddenInputValue(value);
    }
  }, [value]);

  // Sync internal value changes to hidden input
  React.useEffect(() => {
    setHiddenInputValue(internalValue);
  }, [internalValue]);

  return (
    <SelectContext.Provider value={{ value: internalValue, onValueChange: handleValueChange }}>
      {name && <input type="hidden" name={name} value={hiddenInputValue} />}
      {children}
    </SelectContext.Provider>
  );
};

// SelectGroup component
const SelectGroup: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

// SelectValue component (used inside trigger to show selected value)
const SelectValue: React.FC<{ placeholder?: string }> = ({ placeholder }) => {
  const { value } = React.useContext(SelectContext);
  return <span>{value || placeholder}</span>;
};

// SelectTrigger component
interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
      >
        {children}
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
    );
  }
);
SelectTrigger.displayName = 'SelectTrigger';

// SelectContent component (portal wrapper)
interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
  position?: 'popper' | 'item-aligned';
}

const SelectContent: React.FC<SelectContentProps> = ({ children, className }) => {
  return (
    <div
      className={cn(
        'relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md',
        className
      )}
    >
      <div className="p-1">{children}</div>
    </div>
  );
};
SelectContent.displayName = 'SelectContent';

// SelectLabel component
const SelectLabel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('py-1.5 pl-8 pr-2 text-sm font-semibold', className)} {...props} />
  )
);
SelectLabel.displayName = 'SelectLabel';

// SelectItem component
interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  children: React.ReactNode;
}

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ className, children, value, ...props }, ref) => {
    const { value: selectedValue, onValueChange } = React.useContext(SelectContext);
    const isSelected = selectedValue === value;

    return (
      <div
        ref={ref}
        role="option"
        aria-selected={isSelected}
        className={cn(
          'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
          className
        )}
        onClick={() => onValueChange?.(value)}
        {...props}
      >
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          {isSelected && <Check className="h-4 w-4" />}
        </span>
        {children}
      </div>
    );
  }
);
SelectItem.displayName = 'SelectItem';

// SelectSeparator component
const SelectSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('-mx-1 my-1 h-px bg-muted', className)} {...props} />
  )
);
SelectSeparator.displayName = 'SelectSeparator';

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
};
