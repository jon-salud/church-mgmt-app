/**
 * Supported theme presets for the application.
 * Maps to CSS custom property overrides in web layer.
 */
export enum ThemePreset {
  ORIGINAL = 'original',
  VIBRANT_BLUE = 'vibrant-blue',
  TEAL_ACCENT = 'teal-accent',
  WARM_ACCENT = 'warm-accent',
}

/**
 * User's complete theme configuration
 */
export interface ThemePreferences {
  themePreference: ThemePreset;
  themeDarkMode: boolean;
}

/**
 * Type guard to validate theme preset strings
 */
export function isValidThemePreset(value: string): value is ThemePreset {
  return Object.values(ThemePreset).includes(value as ThemePreset);
}
