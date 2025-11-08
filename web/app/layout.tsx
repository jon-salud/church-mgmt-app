import { Metadata, Viewport } from 'next';
import { cookies } from 'next/headers';
import './globals.css';
import { ServiceWorkerRegister } from '../components/service-worker-register';
import { ThemeProvider } from '../components/theme-provider';
import { ThemeApplier } from '../components/theme-applier';
import { AppLayout } from './app-layout';
import { getUserPreferences } from './actions/preferences';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Church Management Console',
  description: 'Member, group, events, announcements, and giving management for the ACC MVP.',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#0f172a',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Check if user is authenticated by checking for session/demo tokens
  const cookieStore = cookies();
  const sessionToken = cookieStore.get('session_token');
  const demoToken = cookieStore.get('demo_token');
  const isAuthenticated = !!(sessionToken || demoToken);

  // Fetch user preferences server-side (before hydration)
  // Use defaults for unauthenticated users
  const preferences = isAuthenticated
    ? await getUserPreferences()
    : {
        themePreference: 'original' as const,
        themeDarkMode: false,
        fontSizePreference: '16px' as const,
      };

  return (
    <html lang="en" suppressHydrationWarning data-theme={preferences.themePreference}>
      <head>
        {/* Inline script to prevent FOUC (Flash of Unstyled Content) */}
        {/* This applies the theme and font size before React hydration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = '${preferences.themePreference}';
                  const fontSize = '${preferences.fontSizePreference}';
                  document.documentElement.setAttribute('data-theme', theme);
                  document.documentElement.style.setProperty('--base-font-size', fontSize);
                } catch (e) {
                  // Log error for debugging (safe because it's in try-catch)
                  if (typeof console !== 'undefined') {
                    console.warn('Failed to apply theme/font size:', e);
                  }
                  // Defaults will apply
                }
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen">
        <ThemeProvider
          attribute="class"
          defaultTheme={preferences.themeDarkMode ? 'dark' : 'light'}
          enableSystem={false}
        >
          <ThemeApplier themePreference={preferences.themePreference} />
          <AppLayout>{children}</AppLayout>
          <ServiceWorkerRegister />
        </ThemeProvider>
      </body>
    </html>
  );
}
