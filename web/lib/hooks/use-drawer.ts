'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';

export interface UseDrawerOptions {
  replace?: boolean;
}

export interface UseDrawerReturn {
  isOpen: boolean;
  drawerId: string | null;
  open: (id: string, options?: UseDrawerOptions) => void;
  close: (options?: UseDrawerOptions) => void;
  toggle: (id: string, options?: UseDrawerOptions) => void;
}

/**
 * Hook for managing drawer state via URL parameters
 *
 * @param specificDrawerId - Optional specific drawer ID to track
 * @returns Drawer state and control functions
 *
 * @example
 * ```tsx
 * // Generic drawer (any drawer ID)
 * const drawer = useDrawer();
 * drawer.open('member-123');
 *
 * // Specific drawer (only tracks 'member-details')
 * const memberDrawer = useDrawer('member-details');
 * memberDrawer.open('member-details');
 * ```
 */
export function useDrawer(specificDrawerId?: string): UseDrawerReturn {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentDrawerId = searchParams.get('drawer');

  const isOpen = useMemo(() => {
    if (!currentDrawerId) return false;
    if (specificDrawerId) return currentDrawerId === specificDrawerId;
    return true;
  }, [currentDrawerId, specificDrawerId]);

  const drawerId = useMemo(() => {
    if (!currentDrawerId) return null;
    if (specificDrawerId && currentDrawerId !== specificDrawerId) return null;
    return currentDrawerId;
  }, [currentDrawerId, specificDrawerId]);

  const updateUrl = useCallback(
    (params: URLSearchParams, options?: UseDrawerOptions) => {
      const url = `?${params.toString()}`;
      if (options?.replace) {
        router.replace(url);
      } else {
        router.push(url);
      }
    },
    [router]
  );

  const open = useCallback(
    (id: string, options?: UseDrawerOptions) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('drawer', id);
      updateUrl(params, options);
    },
    [searchParams, updateUrl]
  );

  const close = useCallback(
    (options?: UseDrawerOptions) => {
      if (!currentDrawerId) return;

      const params = new URLSearchParams(searchParams.toString());
      params.delete('drawer');
      updateUrl(params, options);
    },
    [currentDrawerId, searchParams, updateUrl]
  );

  const toggle = useCallback(
    (id: string, options?: UseDrawerOptions) => {
      if (currentDrawerId === id) {
        close(options);
      } else {
        open(id, options);
      }
    },
    [currentDrawerId, open, close]
  );

  return {
    isOpen,
    drawerId,
    open,
    close,
    toggle,
  };
}
