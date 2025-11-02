'use client';

import { cn } from '@/lib/utils';

// Maintain exact same API as current PageHeader component
interface PageHeaderProps {
  title: string;
  className?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, className, children }: PageHeaderProps) {
  return (
    <header className={cn('container mx-auto p-4', className)}>
      <h1 className="text-3xl font-semibold mb-6">{title}</h1>
      {children}
    </header>
  );
}
