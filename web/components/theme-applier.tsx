'use client';

import { useEffect } from 'react';

interface ThemeApplierProps {
  themePreference: 'original' | 'vibrant-blue' | 'teal-accent' | 'warm-accent';
}

/**
 * Client component that applies the user's theme preference to the HTML element.
 * This runs on every page to ensure the theme persists across navigation.
 *
 * The theme is loaded server-side in layout.tsx, but we need this client component
 * to ensure it's applied correctly during client-side navigation in Next.js App Router.
 */
export function ThemeApplier({ themePreference }: ThemeApplierProps) {
  useEffect(() => {
    // Apply theme attribute to HTML element
    // This ensures theme persists across client-side navigation
    document.documentElement.setAttribute('data-theme', themePreference);
  }, [themePreference]);

  // This component doesn't render anything
  return null;
}
