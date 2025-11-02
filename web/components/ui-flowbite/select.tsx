'use client';

import * as React from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

// Maintain exact same compound component API as current Select component
// This is a complex wrapper to maintain Radix-style API

interface SelectContextValue {
  value?: string;
  onValueChange?: (value: string) => void;
  triggerId?: string;
  open?: boolean;
  setOpen?: (open: boolean) => void;
  selectedLabel?: string;
  setSelectedLabel?: (label: string) => void;
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
  const [open, setOpen] = React.useState(false);
  const [selectedLabel, setSelectedLabel] = React.useState('');
  const triggerId = React.useId();

  const handleValueChange = (newValue: string) => {
    setInternalValue(newValue);
    setOpen(false); // Close dropdown after selection
    onValueChange?.(newValue);
  };

  // Sync external value changes
  React.useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);

  return (
    <SelectContext.Provider
      value={{
        value: internalValue,
        onValueChange: handleValueChange,
        triggerId,
        open,
        setOpen,
        selectedLabel,
        setSelectedLabel,
      }}
    >
      {name && <input type="hidden" name={name} value={internalValue} />}
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
  const { selectedLabel } = React.useContext(SelectContext);
  return <span>{selectedLabel || placeholder}</span>;
};

// SelectTrigger component
interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, onClick, ...props }, ref) => {
    const { triggerId, open, setOpen } = React.useContext(SelectContext);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      setOpen?.(!open);
      onClick?.(e);
    };

    return (
      <button
        ref={ref}
        type="button"
        id={triggerId}
        onClick={handleClick}
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
  'aria-label'?: string;
}

const SelectContent: React.FC<SelectContentProps> = ({
  children,
  className,
  'aria-label': ariaLabel,
}) => {
  const { triggerId, open } = React.useContext(SelectContext);

  if (!open) return null;

  return (
    <div
      role="listbox"
      aria-labelledby={!ariaLabel ? triggerId : undefined}
      aria-label={ariaLabel}
      className={cn(
        'absolute z-50 mt-1 w-full min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md',
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
    const {
      value: selectedValue,
      onValueChange,
      setSelectedLabel,
    } = React.useContext(SelectContext);
    const isSelected = selectedValue === value;

    const handleClick = () => {
      onValueChange?.(value);
      setSelectedLabel?.(typeof children === 'string' ? children : value);
    };

    return (
      <div
        ref={ref}
        role="option"
        aria-selected={isSelected}
        className={cn(
          'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
          className
        )}
        onClick={handleClick}
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
