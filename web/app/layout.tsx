import { Metadata, Viewport } from 'next';
import './globals.css';
import { api } from '../lib/api.server';
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
  { href: '/documents', label: 'Documents', icon: 'FileText' },
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

const leaderNavItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: 'Home' },
  { href: '/groups', label: 'My Groups', icon: 'UserRoundCog' },
  { href: '/events', label: 'Events', icon: 'Calendar' },
  { href: '/announcements', label: 'Announcements', icon: 'Megaphone' },
  { href: '/prayer', label: 'Prayer Wall', icon: 'HeartHandshake' },
  { href: '/pastoral-care', label: 'Pastoral Care', icon: 'HeartPulse' },
  { href: '/checkin/dashboard', label: 'Check-In', icon: 'MonitorCheck' },
];

const basicMemberNavItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: 'Home' },
  { href: '/events', label: 'Events', icon: 'Calendar' },
  { href: '/announcements', label: 'Announcements', icon: 'Megaphone' },
  { href: '/prayer', label: 'Prayer Wall', icon: 'HeartHandshake' },
  { href: '/requests', label: 'Requests', icon: 'HeartHandshake' },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getNavigationItems(userRoles: any[]) {
  const hasAdminRole = userRoles?.some(
    (role: any) => role?.slug === 'admin' || role?.role === 'Admin'
  );

  const hasLeaderRole = userRoles?.some(
    (role: any) => role?.slug === 'leader' || role?.role === 'Leader'
  );

  if (hasAdminRole) {
    return {
      memberNavItems,
      givingNavItems,
      adminNavItems,
    };
  } else if (hasLeaderRole) {
    return {
      memberNavItems: leaderNavItems,
      givingNavItems,
      adminNavItems: [], // Leaders don't get admin nav
    };
  } else {
    // Basic member
    return {
      memberNavItems: basicMemberNavItems,
      givingNavItems,
      adminNavItems: [], // Members don't get admin nav
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
  } = getNavigationItems(me?.user?.roles || []);

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
