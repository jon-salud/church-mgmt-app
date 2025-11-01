import { Metadata, Viewport } from 'next';
import './globals.css';
import { ServiceWorkerRegister } from '../components/service-worker-register';
import { ThemeProvider } from '../components/theme-provider';
import { AppLayout } from './app-layout';

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
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AppLayout>{children}</AppLayout>
          <ServiceWorkerRegister />
        </ThemeProvider>
      </body>
    </html>
  );
}
