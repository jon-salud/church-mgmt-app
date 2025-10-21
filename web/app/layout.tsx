import { Metadata, Viewport } from 'next';
import Link from 'next/link';
import './globals.css';
import { api } from '../lib/api.server';
import { ServiceWorkerRegister } from '../components/service-worker-register';
import { logoutAction } from './actions';

export const metadata: Metadata = {
  title: 'Church Management Console',
  description: 'Member, group, events, announcements, and giving management for the ACC MVP.',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#0f172a',
};

const memberNavItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/members', label: 'Members' },
  { href: '/households', label: 'Households' },
  { href: '/groups', label: 'Groups' },
  { href: '/events', label: 'Events' },
  { href: '/announcements', label: 'Announcements' },
  { href: '/prayer', label: 'Prayer Wall' },
];

const givingNavItems = [{ href: '/giving', label: 'Giving' }];

const adminNavItems = [
  { href: '/roles', label: 'Roles' },
  { href: '/audit-log', label: 'Audit Log' },
  { href: '/pastoral-care', label: 'Pastoral Care' },
  { href: '/checkin/dashboard', label: 'Check-In' },
  { href: '/settings', label: 'Settings' },
];

function NavSection({ title, items }: { title: string; items: { href: string; label: string }[] }) {
  return (
    <div className="space-y-2">
      <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</h3>
      {items.map(item => (
        <Link
          key={item.href}
          href={item.href}
          className="block rounded-md px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const me = await api.currentUser();
  const displayName = me?.user?.profile
    ? `${me.user.profile.firstName} ${me.user.profile.lastName ?? ''}`.trim()
    : me?.user?.primaryEmail || 'Demo Admin';
  const roles = me?.user?.roles ?? [];
  const isAdmin = roles.some((entry: any) => entry?.slug === 'admin' || entry?.role === 'Admin');
  const primaryRole = roles[0]?.role ?? (isAdmin ? 'Admin' : 'Member');

  return (
    <html lang="en" className="bg-slate-900">
      <body className="min-h-screen bg-slate-900 text-slate-100">
        <ServiceWorkerRegister />
        <div className="flex min-h-screen flex-col">
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>
          <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
              <div>
                <Link href="/dashboard" className="text-xl font-semibold tracking-tight">
                  Auckland Community Church
                </Link>
                <p className="text-xs text-slate-400">Role: {primaryRole}</p>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <span className="hidden md:inline">{displayName}</span>
                <form action={logoutAction}>
                  <button className="rounded-md border border-slate-600 px-3 py-1 text-xs uppercase tracking-wide text-slate-200 transition hover:bg-slate-800">
                    Logout
                  </button>
                </form>
              </div>
            </div>
          </header>
          <div className="flex flex-1 flex-col md:flex-row">
            <aside
              className="border-b border-slate-900 bg-slate-950 px-4 py-4 md:w-64 md:border-b-0 md:border-r"
              aria-label="Secondary navigation"
            >
              <nav className="grid gap-4" aria-label="Section navigation">
                <NavSection title="Member" items={memberNavItems} />
                <NavSection title="Giving" items={givingNavItems} />
                {isAdmin && <NavSection title="Admin" items={adminNavItems} />}
              </nav>
            </aside>
            <main id="main-content" className="flex-1 bg-slate-900/60 p-6">
              <div className="mx-auto w-full max-w-4xl space-y-8" data-testid="page-content">
                {children}
              </div>
            </main>
          </div>
          <footer className="border-t border-slate-800 bg-slate-950/80 px-6 py-4 text-center text-xs text-slate-500">
            Demo data only • Install via browser menu for offline-ready dashboard snapshot.
          </footer>
        </div>
      </body>
    </html>
  );
}
