'use server';

import { apiFetch } from '../../lib/api.server';

/**
 * User preferences from the API (theme + font size)
 */
export interface UserPreferences {
  themePreference: 'original' | 'vibrant-blue' | 'teal-accent' | 'warm-accent';
  themeDarkMode: boolean;
  fontSizePreference: '14px' | '16px' | '18px' | '20px';
}

/**
 * Default user preferences for unauthenticated users or API failures
 */
const PREFERENCES_DEFAULTS: UserPreferences = {
  themePreference: 'original',
  themeDarkMode: false,
  fontSizePreference: '16px',
};

/**
 * Valid theme preset values (used for validation and XSS prevention)
 */
const VALID_THEMES = ['original', 'vibrant-blue', 'teal-accent', 'warm-accent'] as const;

/**
 * Valid font size preset values (used for validation and XSS prevention)
 */
const VALID_FONT_SIZES = ['14px', '16px', '18px', '20px'] as const;

/**
 * Type guard to validate API response structure
 * Prevents XSS attacks and runtime errors from malformed data
 */
function isValidPreferencesResponse(data: unknown): data is UserPreferences {
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

  // Validate fontSizePreference is a string and matches enum
  if (
    typeof obj.fontSizePreference !== 'string' ||
    !VALID_FONT_SIZES.includes(obj.fontSizePreference as any)
  ) {
    return false;
  }

  return true;
}

/**
 * Fetches the current user's preferences from the API.
 * This is a server action that runs on the server-side only.
 *
 * Uses the standard apiFetch helper for consistency with other API calls.
 * Validates API response to prevent XSS and runtime errors.
 *
 * @returns User's preferences or defaults if not authenticated/failed
 *
 * @example
 * ```tsx
 * const prefs = await getUserPreferences();
 * console.log(prefs.themePreference); // 'original' | 'vibrant-blue' | ...
 * console.log(prefs.fontSizePreference); // '14px' | '16px' | ...
 * ```
 */
export async function getUserPreferences(): Promise<UserPreferences> {
  try {
    // Use standard apiFetch helper (handles auth, base URL, errors)
    const data = await apiFetch<unknown>('/users/me/preferences');

    // Validate response structure (prevents XSS and runtime errors)
    if (!isValidPreferencesResponse(data)) {
      console.warn('Invalid preferences data from API, using defaults:', data);
      return PREFERENCES_DEFAULTS;
    }

    return data;
  } catch (error) {
    // apiFetch throws on auth errors, network errors, non-200 responses
    console.error('Error fetching user preferences:', error);
    return PREFERENCES_DEFAULTS;
  }
}

/**
 * DTO for updating user preferences
 */
export interface UpdatePreferencesDto {
  themePreference: 'original' | 'vibrant-blue' | 'teal-accent' | 'warm-accent';
  themeDarkMode: boolean;
  fontSizePreference: '14px' | '16px' | '18px' | '20px';
}

/**
 * Updates the current user's preferences via the API.
 * This is a server action that runs on the server-side only.
 *
 * Uses the standard apiFetch helper for consistency with other API calls.
 * Throws error if unauthenticated (client should handle gracefully).
 *
 * @param dto - Preferences to update
 * @throws Error if authentication required or API request fails
 *
 * @example
 * ```tsx
 * try {
 *   await updateUserPreferences({
 *     themePreference: 'vibrant-blue',
 *     themeDarkMode: true,
 *     fontSizePreference: '18px'
 *   });
 *   console.log('Preferences saved!');
 * } catch (error) {
 *   console.error('Failed to save preferences:', error);
 * }
 * ```
 */
export async function updateUserPreferences(dto: UpdatePreferencesDto): Promise<void> {
  try {
    // Use standard apiFetch helper (handles auth, base URL, errors)
    await apiFetch('/users/me/preferences', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dto),
    });
  } catch (error) {
    console.error('Failed to update preferences:', error);
    throw error; // Re-throw for client to handle
  }
}
