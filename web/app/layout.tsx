import { Metadata, Viewport } from 'next';
import './globals.css';
import { api } from '../lib/api.static';
import { ServiceWorkerRegister } from '../components/service-worker-register';
import { ThemeProvider } from '../components/theme-provider';
import { AppLayout } from './app-layout';
import { NavItem } from '../components/sidebar-nav';

export const metadata: Metadata = {
  title: 'Church Management Console',
  description: 'Member, group, events, announcements, and giving management for the ACC MVP.',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#0f172a',
};

const memberNavItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: 'Home' },
  { href: '/members', label: 'Members', icon: 'Users' },
  { href: '/households', label: 'Households', icon: 'UsersRound' },
  { href: '/groups', label: 'Groups', icon: 'UserRoundCog' },
  { href: '/events', label: 'Events', icon: 'Calendar' },
  { href: '/announcements', label: 'Announcements', icon: 'Megaphone' },
  { href: '/prayer', label: 'Prayer Wall', icon: 'HeartHandshake' },
  { href: '/requests', label: 'Requests', icon: 'HeartHandshake' },
];

const givingNavItems: NavItem[] = [{ href: '/giving', label: 'Giving', icon: 'DollarSign' }];

const adminNavItems: NavItem[] = [
  { href: '/roles', label: 'Roles', icon: 'ShieldCheck' },
  { href: '/audit-log', label: 'Audit Log', icon: 'History' },
  { href: '/pastoral-care', label: 'Pastoral Care', icon: 'HeartPulse' },
  { href: '/checkin/dashboard', label: 'Check-In', icon: 'MonitorCheck' },
  { href: '/settings', label: 'Settings', icon: 'Settings' },
];

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const me = await api.currentUser();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ServiceWorkerRegister />
          <AppLayout
            me={me}
            memberNavItems={memberNavItems}
            givingNavItems={givingNavItems}
            adminNavItems={adminNavItems}
          >
            {children}
          </AppLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
