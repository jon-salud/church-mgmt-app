'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

// Type alias for native DOM Element
type DOMElement = Element;

interface PortalProps {
  children: ReactNode;
  container?: DOMElement | null;
}

/**
 * Portal component renders children into a DOM node outside the parent component's hierarchy.
 * By default, renders into document.body.
 */
export function Portal({ children, container }: PortalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) {
    return null;
  }

  return createPortal(children, container || document.body);
}
