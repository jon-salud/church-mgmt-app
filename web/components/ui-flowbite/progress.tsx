'use client';

import * as React from 'react';
import { Progress as FlowbiteProgress } from 'flowbite-react';

// Maintain exact same API as current Progress component
interface ProgressProps {
  value: number;
  className?: string;
}

export function Progress({ value, className }: ProgressProps) {
  return (
    <FlowbiteProgress
      progress={Math.min(100, Math.max(0, value))}
      className={className}
      size="sm"
      color="blue"
    />
  );
}
