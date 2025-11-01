'use client';

import * as React from 'react';
import { Label as FlowbiteLabel } from 'flowbite-react';
import type { LabelProps } from 'flowbite-react';

// Maintain exact same API as current Label component
type Props = React.LabelHTMLAttributes<React.ElementRef<'label'>>;

export const Label = React.forwardRef<React.ElementRef<'label'>, Props>(
  ({ className = '', ...props }, ref) => {
    return <FlowbiteLabel ref={ref} className={className} {...(props as LabelProps)} />;
  }
);

Label.displayName = 'Label';
