import { Metadata, Viewport } from 'next';
import './globals.css';
import { ServiceWorkerRegister } from '../components/service-worker-register';
import { ThemeProvider } from '../components/theme-provider';
import { AppLayout } from './app-layout';
import { getUserTheme } from './actions/theme';

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
  // Fetch user theme preferences server-side (before hydration)
  const theme = await getUserTheme();

  return (
    <html lang="en" suppressHydrationWarning data-theme={theme.themePreference}>
      <head>
        {/* Inline script to prevent FOUC (Flash of Unstyled Content) */}
        {/* This applies the theme before React hydration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = '${theme.themePreference}';
                  document.documentElement.setAttribute('data-theme', theme);
                } catch (e) {
                  // Log error for debugging (safe because it's in try-catch)
                  if (typeof console !== 'undefined') {
                    console.warn('Failed to apply theme:', e);
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
          defaultTheme={theme.themeDarkMode ? 'dark' : 'light'}
          enableSystem={false}
        >
          <AppLayout>{children}</AppLayout>
          <ServiceWorkerRegister />
        </ThemeProvider>
      </body>
    </html>
  );
}
