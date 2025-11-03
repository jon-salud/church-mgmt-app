/**
 * Simple toast notification system using console logging.
 *
 * TODO: Replace with proper toast component in future sprint
 * Issue: This uses console for now but provides structured API
 * Target: UX enhancement sprint
 *
 * A proper implementation would include:
 * - Non-blocking UI component (React Portal)
 * - Auto-dismiss after timeout (3-5 seconds)
 * - Stack multiple toasts vertically
 * - Accessible (ARIA live regions)
 * - Customizable positioning (top-right, bottom-right, etc.)
 * - Different styles per type (success=green, error=red, etc.)
 */

export const toast = {
  success: (message: string) => {
    console.log(`✅ SUCCESS: ${message}`);
    // In production, this would trigger a toast component
  },

  error: (message: string) => {
    console.error(`❌ ERROR: ${message}`);
    // For critical errors, still use alert temporarily
    window.alert(`Error: ${message}`);
  },

  warning: (message: string) => {
    console.warn(`⚠️ WARNING: ${message}`);
    // In production, this would show warning toast
  },

  info: (message: string) => {
    console.info(`ℹ️ INFO: ${message}`);
    // In production, this would show info toast
  },
};

/**
 * TECH DEBT NOTICE:
 * This is a minimal implementation to avoid blocking UI with window.alert
 * for all cases while providing a consistent API across the application.
 *
 * Benefits of future proper implementation:
 * - Better UX (non-blocking notifications)
 * - Visual consistency across app
 * - Reduced cognitive load (users don't need to dismiss alerts)
 * - Improved accessibility (screen reader announcements)
 * - Professional appearance
 */
