'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '../lib/utils';
import { Icon, icons } from './icon';

export interface NavItem {
  href: string;
  label: string;
  icon: keyof typeof icons;
}

interface NavSectionProps {
  title: string;
  items: NavItem[];
}

function NavSection({ title, items }: NavSectionProps) {
  const pathname = usePathname();

  return (
    <div className="space-y-1">
      <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {title}
      </h3>
      {items.map(item => {
        const isActive = pathname === item.href;
        // Generate ID: /dashboard -> nav-link-dashboard, /audit-log -> nav-link-audit-log, /checkin/dashboard -> nav-link-checkin-dashboard
        const idSuffix = item.href.split('/').filter(Boolean).join('-');
        return (
          <Link
            id={`nav-link-${idSuffix}`}
            key={item.href}
            href={item.href}
            className={cn(
              'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition',
              isActive
                ? 'bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-slate-50'
                : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800/60'
            )}
          >
            <Icon
              name={item.icon}
              className="mr-3 h-5 w-5 text-slate-500 transition group-hover:text-slate-600 dark:text-slate-400 dark:group-hover:text-slate-300"
            />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}

interface SidebarNavProps {
  memberNavItems: NavItem[];
  givingNavItems: NavItem[];
  adminNavItems: NavItem[];
  isAdmin: boolean;
}

export function SidebarNav({
  memberNavItems,
  givingNavItems,
  adminNavItems,
  isAdmin,
}: SidebarNavProps) {
  return (
    <nav className="grid gap-4" aria-label="Section navigation">
      <NavSection title="Member" items={memberNavItems} />
      <NavSection title="Giving" items={givingNavItems} />
      {isAdmin && <NavSection title="Admin" items={adminNavItems} />}
    </nav>
  );
}
