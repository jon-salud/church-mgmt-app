import { Metadata, Viewport } from 'next';
import './globals.css';
import { api } from '../lib/api.server';
import { ServiceWorkerRegister } from '../components/service-worker-register';
import { ThemeProvider } from '../components/theme-provider';
import { AppLayout } from './app-layout';
import { NavItem } from '../components/sidebar-nav';
import { hasRole } from '../lib/utils';
import type { Role } from '../lib/types';

export const metadata: Metadata = {
  title: 'Church Management Console',
  description: 'Member, group, events, announcements, and giving management for the ACC MVP.',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#0f172a',
};

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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const me = await api.currentUser();

  // Check if user needs onboarding
  let onboardingRequired = false;
  let settings: Record<string, unknown> = {};
  const churchId = me?.user?.roles?.[0]?.churchId;
  if (churchId) {
    try {
      settings = await api.getSettings(churchId);
      onboardingRequired = !settings.onboardingComplete;
    } catch (error) {
      // If settings fetch fails, continue with normal layout
      console.error('Failed to fetch settings:', error);
    }
  }

  // Get role-based navigation items
  const {
    memberNavItems: filteredMemberNavItems,
    givingNavItems: filteredGivingNavItems,
    adminNavItems: filteredAdminNavItems,
  } = getFilteredNavItems(me?.user?.roles || []);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ServiceWorkerRegister />
          <AppLayout
            me={me}
            memberNavItems={filteredMemberNavItems}
            givingNavItems={filteredGivingNavItems}
            adminNavItems={filteredAdminNavItems}
            onboardingRequired={onboardingRequired}
            churchId={churchId}
            initialSettings={settings}
          >
            {children}
          </AppLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
