'use server';

import { cookies } from 'next/headers';

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
 * Fetches the current user's theme preferences from the API.
 * This is a server action that runs on the server-side only.
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
  const cookieStore = cookies();
  const token = cookieStore.get('demo_token')?.value;

  // Return defaults for unauthenticated users
  if (!token) {
    return THEME_DEFAULTS;
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${apiUrl}/api/users/me/theme`, {
      headers: {
        Cookie: `demo_token=${token}`,
      },
      cache: 'no-store', // Always fetch fresh theme preferences
      next: { revalidate: 0 }, // Disable caching in Next.js
    });

    if (!response.ok) {
      console.warn(`Failed to fetch user theme (status ${response.status}), using defaults`);
      return THEME_DEFAULTS;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching user theme:', error);
    return THEME_DEFAULTS;
  }
}
