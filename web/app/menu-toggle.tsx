'use client';

import { Icon } from '@/components/icon';
import { useState } from 'react';

export function MenuToggle() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <button
      id="menu-toggle"
      onClick={() => {
        setIsSidebarOpen(prev => !prev);
        // Toggle sidebar visibility
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
          if (!isSidebarOpen) {
            sidebar.classList.remove('hidden');
            sidebar.classList.add('!block');
          } else {
            sidebar.classList.remove('!block');
            sidebar.classList.add('hidden');
          }
        }
      }}
      className="inline-flex h-8 w-8 items-center justify-center rounded-md border bg-background transition md:hidden"
      aria-label="Toggle menu"
    >
      <Icon name="Menu" />
    </button>
  );
}
