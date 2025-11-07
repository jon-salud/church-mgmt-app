'use client';

import * as React from 'react';
import { Type } from 'lucide-react';
import { updateUserPreferences } from '@/app/actions/preferences';

type FontSizePreset = '14px' | '16px' | '18px' | '20px';

interface FontSizeOption {
  value: FontSizePreset;
  label: string;
  description: string;
}

const FONT_SIZE_OPTIONS: FontSizeOption[] = [
  { value: '14px', label: 'Small', description: 'Compact and space-efficient' },
  { value: '16px', label: 'Default', description: 'Standard readability' },
  { value: '18px', label: 'Large', description: 'Enhanced readability' },
  { value: '20px', label: 'Extra Large', description: 'Maximum accessibility' },
];

interface FontSizeSelectorProps {
  value: FontSizePreset;
  onChange: (fontSize: FontSizePreset) => void;
  previewOnly?: boolean; // If true, doesn't save immediately
}

/**
 * Font size selector component that allows users to choose from 4 preset font sizes.
 * Provides visual preview and accessibility features.
 */
export function FontSizeSelector({ value, onChange, previewOnly = false }: FontSizeSelectorProps) {
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [selectedSize, setSelectedSize] = React.useState<FontSizePreset>(value);

  React.useEffect(() => {
    setSelectedSize(value);
  }, [value]);

  const handleFontSizeChange = async (fontSize: FontSizePreset) => {
    if (fontSize === selectedSize) return;

    setSelectedSize(fontSize);
    onChange(fontSize);

    // Apply the font size immediately for instant feedback
    document.documentElement.style.setProperty('--base-font-size', fontSize);
    document.documentElement.setAttribute('data-font-size', fontSize);

    if (previewOnly) return; // Don't save in preview mode

    setIsUpdating(true);
    try {
      // Update the preference via server action
      await updateUserPreferences({
        themePreference: 'original', // This will be overridden by current theme
        themeDarkMode: false, // This will be overridden by current dark mode setting
        fontSizePreference: fontSize,
      });
    } catch (error) {
      console.error('Failed to update font size preference:', error);
      // Revert on error
      setSelectedSize(value);
      onChange(value);
      // Revert DOM changes
      document.documentElement.style.setProperty('--base-font-size', value);
      document.documentElement.setAttribute('data-font-size', value);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Type className="h-4 w-4" />
        <label className="text-sm font-medium">Font Size</label>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {FONT_SIZE_OPTIONS.map(option => (
          <button
            key={option.value}
            disabled={isUpdating}
            onClick={() => handleFontSizeChange(option.value)}
            className={`
              relative flex flex-col items-center justify-center rounded-lg border p-3 text-center transition-all
              hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
              disabled:opacity-50 disabled:cursor-not-allowed
              ${
                selectedSize === option.value
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border bg-card text-card-foreground'
              }
            `}
            style={{ fontSize: option.value }}
            aria-label={`Select ${option.label} font size (${option.description})`}
            aria-pressed={selectedSize === option.value}
          >
            <div className="font-medium leading-tight">Aa</div>
            <div className="mt-1 text-xs opacity-75">{option.label}</div>
            {selectedSize === option.value && (
              <div
                className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary"
                aria-hidden="true"
              />
            )}
          </button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        Choose your preferred font size for better readability.
      </p>
    </div>
  );
}
