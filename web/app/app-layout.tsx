import { api } from '../lib/api.server';
import { SidebarNav } from '@/components/sidebar-nav';
import { OnboardingModal } from '@/components/onboarding-modal';
import { hasRole } from '../lib/utils';
import { AppLayoutClient } from './app-layout-client';
import type { Role } from '../lib/types';
import type { NavItem } from '../components/sidebar-nav';

interface AppLayoutProps {
  children: React.ReactNode;
}

const givingNavItems: NavItem[] = [{ href: '/giving', label: 'Giving', icon: 'DollarSign' }];

function getFilteredNavItems(userRoles: Role[]) {
  const hasAdminRole = hasRole(userRoles, 'admin');
  const hasLeaderRole = hasRole(userRoles, 'leader');

  // Base navigation items available to all users
  const baseMemberNavItems: NavItem[] = [
    { href: '/dashboard', label: 'Dashboard', icon: 'Home' },
    { href: '/events', label: 'Events', icon: 'Calendar' },
    { href: '/announcements', label: 'Announcements', icon: 'Megaphone' },
    { href: '/prayer', label: 'Prayer Wall', icon: 'HeartHandshake' },
    { href: '/requests', label: 'Requests', icon: 'HeartHandshake' },
  ];

  // Extended member navigation for admins and leaders
  const extendedMemberNavItems: NavItem[] = [
    { href: '/members', label: 'Members', icon: 'Users' },
    { href: '/households', label: 'Households', icon: 'UsersRound' },
    { href: '/groups', label: 'Groups', icon: 'UserRoundCog' },
    { href: '/documents', label: 'Documents', icon: 'FileText' },
  ];

  // Admin-only navigation items
  const adminOnlyNavItems: NavItem[] = [
    { href: '/roles', label: 'Roles', icon: 'ShieldCheck' },
    { href: '/audit-log', label: 'Audit Log', icon: 'History' },
    { href: '/pastoral-care', label: 'Pastoral Care', icon: 'HeartPulse' },
    { href: '/checkin/dashboard', label: 'Check-In', icon: 'MonitorCheck' },
    { href: '/settings', label: 'Settings', icon: 'Settings' },
  ];

  if (hasAdminRole) {
    // Admins get all navigation items
    return {
      memberNavItems: [...baseMemberNavItems, ...extendedMemberNavItems],
      givingNavItems,
      adminNavItems: adminOnlyNavItems,
    };
  } else if (hasLeaderRole) {
    // Leaders get extended member nav but no admin nav
    return {
      memberNavItems: [...baseMemberNavItems, ...extendedMemberNavItems],
      givingNavItems,
      adminNavItems: [], // Leaders don't get admin navigation
    };
  } else {
    // Basic members get only base navigation
    return {
      memberNavItems: baseMemberNavItems,
      givingNavItems,
      adminNavItems: [], // Basic members don't get admin navigation
    };
  }
}

export async function AppLayout({ children }: AppLayoutProps) {
  let me: any = null;
  let settings: Record<string, unknown> = {};

  try {
    me = await api.currentUser();
  } catch (error) {
    console.error('Failed to load current user in AppLayout:', error);
    // Provide a fallback minimal user object to prevent render failures
    me = null;
  }

  if (me?.user?.roles?.[0]?.churchId) {
    try {
      settings = await api.getSettings(me.user.roles[0].churchId);
    } catch (error) {
      console.error('Failed to load settings in AppLayout:', error);
      settings = {};
    }
  }

  // Get role-based navigation items
  const {
    memberNavItems: filteredMemberNavItems,
    givingNavItems: filteredGivingNavItems,
    adminNavItems: filteredAdminNavItems,
  } = getFilteredNavItems(me?.user?.roles || []);

  const displayName = me?.user?.profile
    ? `${me.user.profile.firstName} ${me.user.profile.lastName ?? ''}`.trim()
    : me?.user?.primaryEmail || 'Guest';
  const email = me?.user?.primaryEmail || '';
  const roles = me?.user?.roles ?? [];
  const isAdmin = roles.some((entry: any) => entry?.slug === 'admin');
  const primaryRole = roles[0]?.role ?? (isAdmin ? 'Admin' : 'Member');
  const churchId = me?.user?.roles?.[0]?.churchId;
  const onboardingRequired = !settings.onboardingComplete;

  return (
    <div className="flex min-h-screen flex-col">
      <a id="skip-to-main-content" href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <AppLayoutClient displayName={displayName} email={email} primaryRole={primaryRole}>
        <aside
          id="sidebar"
          className="border-b border-border bg-background px-4 py-4 md:w-64 md:border-b-0 md:border-r hidden md:block"
          aria-label="Secondary navigation"
        >
          <SidebarNav
            isAdmin={isAdmin}
            memberNavItems={filteredMemberNavItems}
            givingNavItems={filteredGivingNavItems}
            adminNavItems={filteredAdminNavItems}
          />
        </aside>
        <main id="main-content" className="flex-1 p-6">
          <div className="mx-auto w-full max-w-4xl space-y-8" data-testid="page-content">
            {children}
          </div>
        </main>
      </AppLayoutClient>
      <footer className="border-t border-border bg-background/80 px-6 py-4 text-center text-xs text-muted-foreground">
        Demo data only • Install via browser menu for offline-ready dashboard snapshot.
      </footer>
      {churchId && (
        <OnboardingModal
          isOpen={onboardingRequired}
          churchId={churchId}
          initialSettings={settings}
        />
      )}
    </div>
  );
}
