'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui-flowbite/card';
import { Label } from '@/components/ui-flowbite/label';
import { Checkbox } from '@/components/ui-flowbite/checkbox';
import { updateUserTheme } from '@/app/actions/theme';
import { useTheme } from 'next-themes';

type ThemePreset = 'original' | 'vibrant-blue' | 'teal-accent' | 'warm-accent';

interface ThemeSettingsProps {
  initialTheme: {
    themePreference: ThemePreset;
    themeDarkMode: boolean;
  };
}

interface ThemeOption {
  id: ThemePreset;
  name: string;
  description: string;
  colors: {
    primary: string;
    accent: string;
  };
}

const themes: ThemeOption[] = [
  {
    id: 'original',
    name: 'Original',
    description: 'Classic blue-gray theme',
    colors: {
      primary: 'hsl(217, 91%, 60%)',
      accent: 'hsl(217, 91%, 60%)',
    },
  },
  {
    id: 'vibrant-blue',
    name: 'Vibrant Blue',
    description: 'Bright and energetic',
    colors: {
      primary: 'hsl(220, 100%, 56%)',
      accent: 'hsl(200, 100%, 50%)',
    },
  },
  {
    id: 'teal-accent',
    name: 'Teal Accent',
    description: 'Calm and professional',
    colors: {
      primary: 'hsl(173, 80%, 40%)',
      accent: 'hsl(173, 80%, 40%)',
    },
  },
  {
    id: 'warm-accent',
    name: 'Warm Accent',
    description: 'Friendly and inviting',
    colors: {
      primary: 'hsl(24, 95%, 53%)',
      accent: 'hsl(24, 95%, 53%)',
    },
  },
];

interface ThemePreviewCardProps {
  theme: ThemeOption;
  isSelected: boolean;
  onSelect: () => void;
}

function ThemePreviewCard({ theme, isSelected, onSelect }: ThemePreviewCardProps) {
  return (
    <button
      onClick={onSelect}
      className={`
        relative p-4 rounded-lg border-2 transition-all text-left
        ${isSelected ? 'border-primary shadow-md ring-2 ring-primary/20' : 'border-border hover:border-primary/50'}
      `}
      aria-pressed={isSelected}
      aria-label={`Select ${theme.name} theme`}
    >
      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2">
          <svg
            className="h-5 w-5 text-primary"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}

      {/* Color Preview Swatches */}
      <div className="flex gap-2 mb-3">
        <div
          className="h-10 w-10 rounded-md border border-border"
          style={{ backgroundColor: theme.colors.primary }}
          aria-label={`${theme.name} primary color`}
        />
        <div
          className="h-10 w-10 rounded-md border border-border"
          style={{ backgroundColor: theme.colors.accent }}
          aria-label={`${theme.name} accent color`}
        />
      </div>

      {/* Theme Info */}
      <div>
        <h3 className="font-semibold text-sm mb-1">{theme.name}</h3>
        <p className="text-xs text-muted-foreground">{theme.description}</p>
      </div>
    </button>
  );
}

export function ThemeSettings({ initialTheme }: ThemeSettingsProps) {
  const [selectedTheme, setSelectedTheme] = useState<ThemePreset>(initialTheme.themePreference);
  const [darkMode, setDarkMode] = useState(initialTheme.themeDarkMode);
  const [isSaving, setIsSaving] = useState(false);
  const { setTheme } = useTheme();

  // Apply the initial theme from server on component mount
  // This ensures the theme is set even when navigating to settings page
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', initialTheme.themePreference);
    setTheme(initialTheme.themeDarkMode ? 'dark' : 'light');
  }, [initialTheme.themePreference, initialTheme.themeDarkMode, setTheme]);

  const handleThemeChange = async (themeId: ThemePreset) => {
    setSelectedTheme(themeId);

    // Update DOM immediately (instant visual feedback)
    document.documentElement.setAttribute('data-theme', themeId);

    // Persist to backend
    setIsSaving(true);
    try {
      await updateUserTheme({
        themePreference: themeId,
        themeDarkMode: darkMode,
      });
    } catch (error) {
      console.error('Failed to save theme preference:', error);
      // Optionally revert on error or show toast notification
    } finally {
      setIsSaving(false);
    }
  };

  const handleDarkModeToggle = async (enabled: boolean) => {
    setDarkMode(enabled);

    // Update dark mode immediately via next-themes
    setTheme(enabled ? 'dark' : 'light');

    // Persist to backend
    setIsSaving(true);
    try {
      await updateUserTheme({
        themePreference: selectedTheme,
        themeDarkMode: enabled,
      });
    } catch (error) {
      console.error('Failed to save dark mode preference:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Theme Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Dark Mode Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="dark-mode" className="text-base font-medium cursor-pointer">
              Dark Mode
            </Label>
            <p className="text-sm text-muted-foreground">
              Switch between light and dark appearance
            </p>
          </div>
          <Checkbox
            id="dark-mode"
            checked={darkMode}
            onCheckedChange={handleDarkModeToggle}
            disabled={isSaving}
            className="h-5 w-5"
          />
        </div>

        {/* Theme Selector */}
        <div>
          <Label className="text-base font-medium">Color Theme</Label>
          <p className="text-sm text-muted-foreground mb-4">Choose your preferred color scheme</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {themes.map(theme => (
              <ThemePreviewCard
                key={theme.id}
                theme={theme}
                isSelected={selectedTheme === theme.id}
                onSelect={() => handleThemeChange(theme.id)}
              />
            ))}
          </div>

          {isSaving && <p className="text-xs text-muted-foreground mt-2">Saving preferences...</p>}
        </div>
      </CardContent>
    </Card>
  );
}
