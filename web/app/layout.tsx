import { Metadata, Viewport } from 'next';
import Link from 'next/link';
import './globals.css';
import { api } from '../lib/api.server';
import { ServiceWorkerRegister } from '../components/service-worker-register';
import { ThemeProvider } from '../components/theme-provider';
import { ThemeSwitcher } from '../components/theme-switcher';
import { SidebarNav } from '../components/sidebar-nav';
import { logoutAction } from './actions';

export const metadata: Metadata = {
  title: 'Church Management Console',
  description: 'Member, group, events, announcements, and giving management for the ACC MVP.',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#0f172a',
};

import { NavItem } from '../components/sidebar-nav';

const memberNavItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: 'Home' },
  { href: '/members', label: 'Members', icon: 'Users' },
  { href: '/households', label: 'Households', icon: 'UsersRound' },
  { href: '/groups', label: 'Groups', icon: 'UserRoundCog' },
  { href: '/events', label: 'Events', icon: 'Calendar' },
  { href: '/announcements', label: 'Announcements', icon: 'Megaphone' },
  { href: '/prayer', label: 'Prayer Wall', icon: 'HeartHandshake' },
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
  const displayName = me?.user?.profile
    ? `${me.user.profile.firstName} ${me.user.profile.lastName ?? ''}`.trim()
    : me?.user?.primaryEmail || 'Demo Admin';
  const roles = me?.user?.roles ?? [];
  const isAdmin = roles.some((entry: any) => entry?.slug === 'admin' || entry?.role === 'Admin');
  const primaryRole = roles[0]?.role ?? (isAdmin ? 'Admin' : 'Member');

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ServiceWorkerRegister />
          <div className="flex min-h-screen flex-col">
            <a id="skip-to-main-content" href="#main-content" className="skip-link">
              Skip to main content
            </a>
          <header className="border-b border-border bg-background/80 backdrop-blur">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
              <div>
                <Link id="dashboard-link" href="/dashboard" className="text-xl font-semibold tracking-tight">
                  Auckland Community Church
                </Link>
                <p className="text-xs text-muted-foreground">Role: {primaryRole}</p>
              </div>
              <div className="flex items-center gap-3 text-sm text-foreground">
                <ThemeSwitcher />
                <span className="hidden md:inline">{displayName}</span>
                <form action={logoutAction}>
                  <button
                    id="logout-button"
                    className="rounded-md border border-border px-3 py-1 text-xs uppercase tracking-wide text-foreground transition hover:bg-muted"
                  >
                    Logout
                  </button>
                </form>
              </div>
            </div>
          </header>
          <div className="flex flex-1 flex-col md:flex-row">
            <aside
              className="border-b border-border bg-background px-4 py-4 md:w-64 md:border-b-0 md:border-r"
              aria-label="Secondary navigation"
            >
              <SidebarNav
                isAdmin={isAdmin}
                memberNavItems={memberNavItems}
                givingNavItems={givingNavItems}
                adminNavItems={adminNavItems}
              />
            </aside>
            <main id="main-content" className="flex-1 p-6">
              <div className="mx-auto w-full max-w-4xl space-y-8" data-testid="page-content">
                {children}
              </div>
            </main>
          </div>
          <footer className="border-t border-border bg-background/80 px-6 py-4 text-center text-xs text-muted-foreground">
            Demo data only • Install via browser menu for offline-ready dashboard snapshot.
          </footer>
        </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
