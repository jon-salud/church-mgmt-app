import { test, expect } from '@playwright/test';
import { LoginPage } from './page-objects/LoginPage';

test.describe('Unauthenticated User Theme Handling', () => {
  test('login page uses default theme for unauthenticated users', async ({ page }) => {
    // Set up console error monitoring BEFORE navigation
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Navigate to login page without authentication
    await page.goto('http://localhost:3000/login');

    // Verify default theme is applied (original)
    const theme = await page.locator('html').getAttribute('data-theme');
    expect(theme).toBe('original');

    // Wait a moment to catch any errors
    await page.waitForTimeout(1000); // Filter out known unrelated errors (if any)
    const themeRelatedErrors = consoleErrors.filter(
      err => err.includes('theme') || err.includes('getUserTheme')
    );

    expect(themeRelatedErrors).toHaveLength(0);
  });

  test('user theme loads correctly after login', async ({ page }) => {
    // First, set a specific theme while logged in
    const loginPage = new LoginPage(page);
    await loginPage.login('demo-admin');

    await page.goto('http://localhost:3000/settings');
    await page.waitForLoadState('networkidle');

    // Wait for theme cards to be hydrated
    const themeCard = page.locator('button[aria-label*="Select"][aria-label*="theme"]').first();
    await themeCard.waitFor({ state: 'visible', timeout: 15000 });

    // Set Vibrant Blue theme
    const vibrantBlueCard = page.getByRole('button', { name: /select vibrant blue theme/i });
    await vibrantBlueCard.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'vibrant-blue');

    // Logout (go to login page, which clears session)
    await page.goto('http://localhost:3000/login');

    // Verify we're back to default theme
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'original');

    // Login again
    await loginPage.login('demo-admin');

    // Navigate to dashboard and verify user's saved theme loads
    await page.goto('http://localhost:3000/dashboard');

    // User's saved theme should be applied (vibrant-blue)
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'vibrant-blue');
  });

  test('direct navigation to authenticated page redirects to login with default theme', async ({
    page,
  }) => {
    // Try to access authenticated page directly without login
    await page.goto('http://localhost:3000/dashboard');

    // Should redirect to login
    await page.waitForURL('**/login**', { timeout: 5000 });

    // Verify default theme on login page
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'original');
  });
});
