'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { SidebarNav } from '@/components/sidebar-nav';
import { logoutAction } from './actions';
import { NavItem } from '../components/sidebar-nav';
import { Icon } from '@/components/icon';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
  me: any; // A more specific type should be used here
  memberNavItems: NavItem[];
  givingNavItems: NavItem[];
  adminNavItems: NavItem[];
}

export function AppLayout({ children, me, memberNavItems, givingNavItems, adminNavItems }: AppLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const displayName = me?.user?.profile
    ? `${me.user.profile.firstName} ${me.user.profile.lastName ?? ''}`.trim()
    : me?.user?.primaryEmail || 'Demo Admin';
  const roles = me?.user?.roles ?? [];
  const isAdmin = roles.some((entry: any) => entry?.slug === 'admin' || entry?.role === 'Admin');
  const primaryRole = roles[0]?.role ?? (isAdmin ? 'Admin' : 'Member');

  return (
    <div className="flex min-h-screen flex-col">
      <a id="skip-to-main-content" href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <header className="border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border bg-background transition md:hidden"
              aria-label="Toggle menu"
            >
              <Icon name="Menu" />
            </button>
            <div>
              <Link id="dashboard-link" href="/dashboard" className="text-xl font-semibold tracking-tight">
                Auckland Community Church
              </Link>
              <p className="text-xs text-muted-foreground">Role: {primaryRole}</p>
            </div>
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
          className={cn(
            'border-b border-border bg-background px-4 py-4 md:w-64 md:border-b-0 md:border-r',
            'transition-all duration-300 ease-in-out',
            isSidebarOpen ? 'block' : 'hidden md:block'
          )}
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
  );
}
