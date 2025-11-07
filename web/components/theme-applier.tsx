'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface ThemeApplierProps {
  themePreference: 'original' | 'vibrant-blue' | 'teal-accent' | 'warm-accent';
}

/**
 * Client component that applies the user's theme preference to the HTML element.
 * This runs on every page to ensure the theme persists across navigation.
 *
 * The theme is loaded server-side in layout.tsx, but we need this client component
 * to ensure it's applied correctly during client-side navigation in Next.js App Router.
 *
 * For unauthenticated routes (/login, /oauth), always uses 'original' theme regardless
 * of the user's saved preference to prevent theme bleeding between sessions.
 */
export function ThemeApplier({ themePreference }: ThemeApplierProps) {
  const pathname = usePathname();

  useEffect(() => {
    // For auth pages, always use 'original' theme
    // This prevents user themes from persisting to unauthenticated state
    const isAuthPage = pathname === '/login' || pathname?.startsWith('/oauth');
    const themeToApply = isAuthPage ? 'original' : themePreference;

    // Apply theme attribute to HTML element
    // This ensures theme persists across client-side navigation
    document.documentElement.setAttribute('data-theme', themeToApply);
  }, [themePreference, pathname]);

  // This component doesn't render anything
  return null;
}
