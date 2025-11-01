'use client';

import { Icon } from '@/components/icon';
import { useState } from 'react';

export function MenuToggle() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Sidebar visibility is controlled by state for mobile
  // We use a global style to toggle display for #sidebar on mobile
  return (
    <>
      <button
        id="menu-toggle"
        onClick={() => setIsSidebarOpen(prev => !prev)}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md border bg-background transition md:hidden"
        aria-label="Toggle menu"
      >
        <Icon name="Menu" />
      </button>
      <style jsx global>{`
        @media (max-width: 767px) {
          #sidebar {
            display: ${isSidebarOpen ? 'block' : 'none'} !important;
          }
        }
      `}</style>
    </>
  );
}
