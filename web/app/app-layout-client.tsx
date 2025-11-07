'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { MenuToggle } from './menu-toggle';
import { UserMenu } from '@/components/user-menu';
import { SettingsModal } from '@/components/settings-modal';

interface AppLayoutClientProps {
  displayName: string;
  email: string;
  primaryRole: string;
  currentTheme: 'original' | 'vibrant-blue' | 'teal-accent' | 'warm-accent';
  currentFontSize: '14px' | '16px' | '18px' | '20px';
  currentThemeDarkMode: boolean;
  children: React.ReactNode;
}

export function AppLayoutClient({
  displayName,
  email,
  primaryRole,
  currentTheme,
  currentFontSize,
  currentThemeDarkMode,
  children,
}: AppLayoutClientProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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
              onSettingsClick={() => setIsSettingsOpen(true)}
            />
          </div>
        </div>
      </header>
      <div className="flex flex-1 flex-col md:flex-row">{children}</div>
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentTheme={currentTheme}
        currentFontSize={currentFontSize}
        currentThemeDarkMode={currentThemeDarkMode}
      />
    </>
  );
}
