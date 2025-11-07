'use client';

import { cn } from '@/lib/utils';

type ThemePreset = 'original' | 'vibrant-blue' | 'teal-accent' | 'warm-accent';

interface ThemeOption {
  value: ThemePreset;
  label: string;
  description: string;
  preview: string; // CSS class for preview
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    value: 'original',
    label: 'Original',
    description: 'Classic design',
    preview: 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600',
  },
  {
    value: 'vibrant-blue',
    label: 'Vibrant Blue',
    description: 'Modern blue theme',
    preview: 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700',
  },
  {
    value: 'teal-accent',
    label: 'Teal Accent',
    description: 'Calming teal tones',
    preview: 'bg-teal-100 dark:bg-teal-900 border-teal-300 dark:border-teal-700',
  },
  {
    value: 'warm-accent',
    label: 'Warm Accent',
    description: 'Cozy warm colors',
    preview: 'bg-orange-100 dark:bg-orange-900 border-orange-300 dark:border-orange-700',
  },
];

interface ThemeSelectorProps {
  value: ThemePreset;
  onChange: (theme: ThemePreset) => void;
}

export function ThemeSelector({ value, onChange }: ThemeSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {THEME_OPTIONS.map(theme => (
          <button
            key={theme.value}
            onClick={() => onChange(theme.value)}
            className={cn(
              'flex flex-col items-center justify-center rounded-lg border p-4 text-center transition-all',
              'hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              value === theme.value ? 'border-primary bg-primary/5' : 'border-border bg-card',
              theme.preview
            )}
            aria-label={`Select ${theme.label} theme`}
            aria-pressed={value === theme.value}
          >
            <div className="w-8 h-8 rounded-full border-2 border-current mb-2"></div>
            <div className="font-medium text-sm">{theme.label}</div>
            <div className="text-xs opacity-75">{theme.description}</div>
            {value === theme.value && (
              <div
                className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary"
                aria-hidden="true"
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
