import * as React from 'react';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default' | 'outline' };

export function Button({ className = '', variant = 'default', ...props }: Props) {
  const base =
    'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition';
  const variants = {
    default: 'bg-gray-900 text-white hover:opacity-90',
    outline: 'border border-gray-300 hover:bg-gray-100',
  };
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}
