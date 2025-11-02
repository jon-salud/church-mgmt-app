'use client';

import * as React from 'react';
import { Check, ChevronRight, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

// Maintain exact same compound component API as current DropdownMenu component
// This wrapper maintains Radix-style API but uses Flowbite internally

interface DropdownContextValue {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const DropdownContext = React.createContext<DropdownContextValue>({});

// Main DropdownMenu component (Root)
interface DropdownMenuProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  open,
  defaultOpen,
  onOpenChange,
  children,
}) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen ?? false);
  const actualOpen = open ?? isOpen;
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    if (!actualOpen) return;

    // eslint-disable-next-line no-undef
    const handleClickOutside = (event: MouseEvent) => {
      // eslint-disable-next-line no-undef
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        handleOpenChange(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [actualOpen]);

  return (
    <DropdownContext.Provider value={{ open: actualOpen, onOpenChange: handleOpenChange }}>
      <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
        {children}
      </div>
    </DropdownContext.Provider>
  );
};

// DropdownMenuTrigger component
interface DropdownMenuTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const DropdownMenuTrigger = React.forwardRef<HTMLButtonElement, DropdownMenuTriggerProps>(
  ({ className, children, asChild, onClick, ...props }, ref) => {
    const { open, onOpenChange } = React.useContext(DropdownContext);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      onOpenChange?.(!open);
    };

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, { ref, onClick: handleClick, ...props } as any);
    }

    return (
      <button ref={ref} type="button" className={className} onClick={handleClick} {...props}>
        {children}
      </button>
    );
  }
);
DropdownMenuTrigger.displayName = 'DropdownMenuTrigger';

// DropdownMenuContent component
interface DropdownMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  sideOffset?: number;
}

const DropdownMenuContent = React.forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  ({ className, sideOffset = 4, ...props }, ref) => {
    const { open } = React.useContext(DropdownContext);

    if (!open) return null;

    return (
      <div
        ref={ref}
        className={cn(
          'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md',
          'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
          className
        )}
        style={{ marginTop: `${sideOffset}px` }}
        {...props}
      />
    );
  }
);
DropdownMenuContent.displayName = 'DropdownMenuContent';

// DropdownMenuItem component
interface DropdownMenuItemProps extends React.HTMLAttributes<HTMLDivElement> {
  inset?: boolean;
}

const DropdownMenuItem = React.forwardRef<HTMLDivElement, DropdownMenuItemProps>(
  ({ className, inset, ...props }, ref) => (
    <div
      ref={ref}
      role="menuitem"
      className={cn(
        'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        inset && 'pl-8',
        className
      )}
      {...props}
    />
  )
);
DropdownMenuItem.displayName = 'DropdownMenuItem';

// DropdownMenuCheckboxItem component
interface DropdownMenuCheckboxItemProps extends React.HTMLAttributes<HTMLDivElement> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const DropdownMenuCheckboxItem = React.forwardRef<HTMLDivElement, DropdownMenuCheckboxItemProps>(
  ({ className, children, checked, onCheckedChange, ...props }, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      props.onClick?.(e);
      onCheckedChange?.(!checked);
    };

    return (
      <div
        ref={ref}
        role="menuitemcheckbox"
        aria-checked={checked}
        className={cn(
          'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
          className
        )}
        {...props}
        onClick={handleClick}
      >
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          {checked && <Check className="h-4 w-4" />}
        </span>
        {children}
      </div>
    );
  }
);
DropdownMenuCheckboxItem.displayName = 'DropdownMenuCheckboxItem';

// DropdownMenuRadioItem component
interface DropdownMenuRadioItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

const DropdownMenuRadioItem = React.forwardRef<HTMLDivElement, DropdownMenuRadioItemProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      role="menuitemradio"
      className={cn(
        'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className
      )}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <Circle className="h-2 w-2 fill-current" />
      </span>
      {children}
    </div>
  )
);
DropdownMenuRadioItem.displayName = 'DropdownMenuRadioItem';

// DropdownMenuLabel component
interface DropdownMenuLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  inset?: boolean;
}

const DropdownMenuLabel = React.forwardRef<HTMLDivElement, DropdownMenuLabelProps>(
  ({ className, inset, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('px-2 py-1.5 text-sm font-semibold', inset && 'pl-8', className)}
      {...props}
    />
  )
);
DropdownMenuLabel.displayName = 'DropdownMenuLabel';

// DropdownMenuSeparator component
const DropdownMenuSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('-mx-1 my-1 h-px bg-muted', className)} {...props} />
));
DropdownMenuSeparator.displayName = 'DropdownMenuSeparator';

// DropdownMenuShortcut component
const DropdownMenuShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span className={cn('ml-auto text-xs tracking-widest opacity-60', className)} {...props} />
  );
};
DropdownMenuShortcut.displayName = 'DropdownMenuShortcut';

// Additional sub-components for compatibility
const DropdownMenuGroup: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>{children}</>
);
const DropdownMenuPortal: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>{children}</>
);
const DropdownMenuSub: React.FC<{ children: React.ReactNode }> = ({ children }) => <>{children}</>;
const DropdownMenuRadioGroup: React.FC<{
  children: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
}> = ({ children }) => <>{children}</>;

interface DropdownMenuSubTriggerProps extends React.HTMLAttributes<HTMLDivElement> {
  inset?: boolean;
}

const DropdownMenuSubTrigger = React.forwardRef<HTMLDivElement, DropdownMenuSubTriggerProps>(
  ({ className, inset, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent',
        inset && 'pl-8',
        className
      )}
      {...props}
    >
      {children}
      <ChevronRight className="ml-auto h-4 w-4" />
    </div>
  )
);
DropdownMenuSubTrigger.displayName = 'DropdownMenuSubTrigger';

const DropdownMenuSubContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
      className
    )}
    {...props}
  />
));
DropdownMenuSubContent.displayName = 'DropdownMenuSubContent';

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
};
