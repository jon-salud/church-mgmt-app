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
 * Supported font size presets for the application.
 * Maps to CSS custom property overrides in web layer.
 */
export enum FontSizePreset {
  SMALL = '14px',
  DEFAULT = '16px',
  LARGE = '18px',
  EXTRA_LARGE = '20px',
}

/**
 * User's complete theme configuration
 */
export interface ThemePreferences {
  themePreference: ThemePreset;
  themeDarkMode: boolean;
}

/**
 * User's complete preferences configuration (theme + font size)
 */
export interface UserPreferences {
  themePreference: ThemePreset;
  themeDarkMode: boolean;
  fontSizePreference: FontSizePreset;
}

/**
 * Type guard to validate theme preset strings
 */
export function isValidThemePreset(value: string): value is ThemePreset {
  return Object.values(ThemePreset).includes(value as ThemePreset);
}

/**
 * Type guard to validate font size preset strings
 */
export function isValidFontSizePreset(value: string): value is FontSizePreset {
  return Object.values(FontSizePreset).includes(value as FontSizePreset);
}
