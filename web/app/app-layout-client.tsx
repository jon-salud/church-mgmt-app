'use client';

import Link from 'next/link';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { MenuToggle } from './menu-toggle';
import { UserMenu } from '@/components/user-menu';
// Phase 2/3: Uncomment when SettingsModal is created
// import { SettingsModal } from '@/components/settings-modal';

interface AppLayoutClientProps {
  displayName: string;
  email: string;
  primaryRole: string;
  children: React.ReactNode;
}

export function AppLayoutClient({
  displayName,
  email,
  primaryRole,
  children,
}: AppLayoutClientProps) {
  // const [isSettingsOpen, setIsSettingsOpen] = useState(false); // Phase 3: Settings modal

  return (
    <>
      <header className="border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <MenuToggle />
            <div>
              <Link
                id="dashboard-link"
                href="/dashboard"
                className="text-xl font-semibold tracking-tight text-foreground hover:text-primary"
              >
                Auckland Community Church
              </Link>
              <p className="text-xs text-muted-foreground">Role: {primaryRole}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm text-foreground">
            <ThemeSwitcher />
            <UserMenu
              displayName={displayName}
              email={email}
              onSettingsClick={() => {}} // Phase 3: setIsSettingsOpen(true)
            />
          </div>
        </div>
      </header>
      <div className="flex flex-1 flex-col md:flex-row">{children}</div>
      {/* Phase 2/3: Uncomment when SettingsModal is created
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentTheme="original"
        currentFontSize="16px"
      />
      */}
    </>
  );
}
