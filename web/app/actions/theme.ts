'use server';

import { apiFetch } from '../../lib/api.server';

/**
 * User theme preferences from the API
 */
export interface ThemePreferences {
  themePreference: 'original' | 'vibrant-blue' | 'teal-accent' | 'warm-accent';
  themeDarkMode: boolean;
}

/**
 * Default theme preferences for unauthenticated users or API failures
 */
const THEME_DEFAULTS: ThemePreferences = {
  themePreference: 'original',
  themeDarkMode: false,
};

/**
 * Valid theme preset values (used for validation and XSS prevention)
 */
const VALID_THEMES = ['original', 'vibrant-blue', 'teal-accent', 'warm-accent'] as const;

/**
 * Type guard to validate API response structure
 * Prevents XSS attacks and runtime errors from malformed data
 */
function isValidThemeResponse(data: unknown): data is ThemePreferences {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const obj = data as Record<string, unknown>;

  // Validate themePreference is a string and matches enum
  if (
    typeof obj.themePreference !== 'string' ||
    !VALID_THEMES.includes(obj.themePreference as any)
  ) {
    return false;
  }

  // Validate themeDarkMode is a boolean
  if (typeof obj.themeDarkMode !== 'boolean') {
    return false;
  }

  return true;
}

/**
 * Fetches the current user's theme preferences from the API.
 * This is a server action that runs on the server-side only.
 *
 * Uses the standard apiFetch helper for consistency with other API calls.
 * Validates API response to prevent XSS and runtime errors.
 *
 * @returns User's theme preferences or defaults if not authenticated/failed
 *
 * @example
 * ```tsx
 * const theme = await getUserTheme();
 * console.log(theme.themePreference); // 'original' | 'vibrant-blue' | ...
 * console.log(theme.themeDarkMode);   // true | false
 * ```
 */
export async function getUserTheme(): Promise<ThemePreferences> {
  try {
    // Use standard apiFetch helper (handles auth, base URL, errors)
    const data = await apiFetch<unknown>('/users/me/theme');

    // Validate response structure (prevents XSS and runtime errors)
    if (!isValidThemeResponse(data)) {
      console.warn('Invalid theme data from API, using defaults:', data);
      return THEME_DEFAULTS;
    }

    return data;
  } catch (error) {
    // apiFetch throws on auth errors, network errors, non-200 responses
    console.error('Error fetching user theme:', error);
    return THEME_DEFAULTS;
  }
}

/**
 * DTO for updating user theme preferences
 */
export interface UpdateThemeDto {
  themePreference: 'original' | 'vibrant-blue' | 'teal-accent' | 'warm-accent';
  themeDarkMode: boolean;
}

/**
 * Updates the current user's theme preferences via the API.
 * This is a server action that runs on the server-side only.
 *
 * Uses the standard apiFetch helper for consistency with other API calls.
 * Throws error if unauthenticated (client should handle gracefully).
 *
 * @param dto - Theme preferences to update
 * @throws Error if authentication required or API request fails
 *
 * @example
 * ```tsx
 * try {
 *   await updateUserTheme({
 *     themePreference: 'vibrant-blue',
 *     themeDarkMode: true
 *   });
 *   console.log('Theme saved!');
 * } catch (error) {
 *   console.error('Failed to save theme:', error);
 * }
 * ```
 */
export async function updateUserTheme(dto: UpdateThemeDto): Promise<void> {
  try {
    // Use standard apiFetch helper (handles auth, base URL, errors)
    await apiFetch('/users/me/theme', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dto),
    });
  } catch (error) {
    console.error('Failed to update theme:', error);
    throw error; // Re-throw for client to handle
  }
}
