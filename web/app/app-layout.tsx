import Link from 'next/link';
import { api } from '../lib/api.server';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { SidebarNav } from '@/components/sidebar-nav';
import { logoutAction } from './actions';
import { NavItem } from '../components/sidebar-nav';
import { OnboardingModal } from '@/components/onboarding-modal';
import { MenuToggle } from './menu-toggle';
import { hasRole } from '../lib/utils';
import type { Role } from '../lib/types';

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
    // Fetch user data once and reuse it
    const userData = await api.currentUser().catch(error => {
      console.error('Failed to load current user:', error);
      return null;
    });

    // Use the same user data to fetch settings
    const settingsData = await (async () => {
      const churchId = userData?.user?.roles?.[0]?.churchId;
      if (churchId) {
        return await api.getSettings(churchId).catch(() => ({}));
      }
      return {};
    })();

    me = userData;
    settings = settingsData;
  } catch (error) {
    console.error('Error in AppLayout:', error);
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
      <header className="border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <MenuToggle />
            <div>
              <Link
                id="dashboard-link"
                href="/dashboard"
                className="text-xl font-semibold tracking-tight"
              >
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
      </div>
      <footer className="border-t border-border bg-background/80 px-6 py-4 text-center text-xs text-muted-foreground">
        Demo data only • Install via browser menu for offline-ready dashboard snapshot.
      </footer>
      {churchId && (
        <OnboardingModal
          isOpen={onboardingRequired}
          onClose={() => {
            /* handled by server revalidation */
          }}
          churchId={churchId}
          initialSettings={settings}
        />
      )}
    </div>
  );
}
