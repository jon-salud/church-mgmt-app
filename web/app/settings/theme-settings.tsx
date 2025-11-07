'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui-flowbite/card';
import { Label } from '@/components/ui-flowbite/label';
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
    background: string;
    primary: string;
    destructive: string;
  };
}

// Theme palettes for both light and dark modes
// Each theme has distinct colors for light and dark variants
const lightThemes: ThemeOption[] = [
  {
    id: 'original',
    name: 'Original',
    description: 'Classic blue-gray theme',
    colors: {
      background: 'hsl(210, 20%, 98%)' /* Light blue-gray background */,
      primary: 'hsl(222, 47%, 11%)' /* Dark slate primary */,
      destructive: 'hsl(0, 84%, 40%)' /* Medium red */,
    },
  },
  {
    id: 'vibrant-blue',
    name: 'Vibrant Blue',
    description: 'Bright and energetic',
    colors: {
      background: 'hsl(210, 20%, 98%)' /* Light blue-gray background */,
      primary: 'hsl(215, 60%, 45%)' /* Bright blue */,
      destructive: 'hsl(0, 72%, 45%)' /* Bright red */,
    },
  },
  {
    id: 'teal-accent',
    name: 'Teal Accent',
    description: 'Calm and professional',
    colors: {
      background: 'hsl(210, 20%, 98%)' /* Light blue-gray background */,
      primary: 'hsl(180, 62%, 34%)' /* Deep teal */,
      destructive: 'hsl(359, 62%, 45%)' /* Warm red */,
    },
  },
  {
    id: 'warm-accent',
    name: 'Warm Accent',
    description: 'Friendly and inviting',
    colors: {
      background: 'hsl(210, 20%, 98%)' /* Light blue-gray background */,
      primary: 'hsl(28, 65%, 40%)' /* Warm orange-brown */,
      destructive: 'hsl(4, 78%, 48%)' /* Warm red */,
    },
  },
];

const darkThemes: ThemeOption[] = [
  {
    id: 'original',
    name: 'Original',
    description: 'Classic blue-gray theme',
    colors: {
      background: 'hsl(222, 15%, 12%)' /* Very dark blue-gray background */,
      primary: 'hsl(210, 40%, 68%)' /* Light blue-gray primary */,
      destructive: 'hsl(0, 84%, 50%)' /* Bright red */,
    },
  },
  {
    id: 'vibrant-blue',
    name: 'Vibrant Blue',
    description: 'Bright and energetic',
    colors: {
      background: 'hsl(222, 15%, 12%)' /* Very dark blue-gray background */,
      primary: 'hsl(215, 70%, 60%)' /* Bright light blue */,
      destructive: 'hsl(0, 80%, 55%)' /* Bright red */,
    },
  },
  {
    id: 'teal-accent',
    name: 'Teal Accent',
    description: 'Calm and professional',
    colors: {
      background: 'hsl(222, 15%, 12%)' /* Very dark blue-gray background */,
      primary: 'hsl(180, 70%, 45%)' /* Bright teal */,
      destructive: 'hsl(359, 75%, 50%)' /* Warm red */,
    },
  },
  {
    id: 'warm-accent',
    name: 'Warm Accent',
    description: 'Friendly and inviting',
    colors: {
      background: 'hsl(222, 15%, 12%)' /* Very dark blue-gray background */,
      primary: 'hsl(28, 80%, 55%)' /* Bright warm orange */,
      destructive: 'hsl(4, 85%, 55%)' /* Bright warm red */,
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

      {/* Color Preview Swatches - 3-color system: background, primary, destructive */}
      <div className="flex gap-2 mb-3">
        <div
          className="h-10 w-10 rounded-md border border-border"
          style={{ backgroundColor: theme.colors.background }}
          aria-label={`${theme.name} background color`}
        />
        <div
          className="h-10 w-10 rounded-md border border-border"
          style={{ backgroundColor: theme.colors.primary }}
          aria-label={`${theme.name} primary color`}
        />
        <div
          className="h-10 w-10 rounded-md border border-border"
          style={{ backgroundColor: theme.colors.destructive }}
          aria-label={`${theme.name} destructive color`}
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
  const [isSaving, setIsSaving] = useState(false);
  const { theme } = useTheme(); // Get current theme mode (light/dark) from header toggle

  // Apply the initial theme from server on component mount
  // This ensures the theme is set even when navigating to settings page
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', initialTheme.themePreference);
  }, [initialTheme.themePreference]);

  // Determine which palette set to show based on current light/dark mode
  const isDarkMode = theme === 'dark';
  const themes = isDarkMode ? darkThemes : lightThemes;

  const handleThemeChange = async (themeId: ThemePreset) => {
    setSelectedTheme(themeId);

    // Update DOM immediately (instant visual feedback)
    document.documentElement.setAttribute('data-theme', themeId);

    // Persist to backend (dark mode is managed by header ThemeSwitcher)
    setIsSaving(true);
    try {
      await updateUserTheme({
        themePreference: themeId,
        themeDarkMode: isDarkMode, // Save current dark mode state
      });
    } catch (error) {
      console.error('Failed to save theme preference:', error);
      // Optionally revert on error or show toast notification
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
        {/* Info: Dark mode toggle is in the header */}
        <div className="rounded-md bg-muted/50 p-3 border border-border">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Tip:</strong> Use the light/dark toggle in the header to switch between
            modes. The theme previews below will update to show colors for the current mode.
          </p>
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
