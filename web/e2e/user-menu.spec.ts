import { test, expect } from '@playwright/test';

test.describe('User Menu Dropdown', () => {
  test.beforeEach(async ({ page }) => {
    // Login as demo user
    await page.goto('/');
    await page
      .context()
      .addCookies([{ name: 'demo_token', value: 'demo-admin', domain: 'localhost', path: '/' }]);
    await page.goto('/dashboard');
  });

  test('opens dropdown and displays user info', async ({ page }) => {
    // Click user menu trigger
    await page.click('button[aria-label="User menu"]');

    // Verify dropdown visible
    await expect(page.locator('text=Settings')).toBeVisible();
    await expect(page.locator('text=Logout')).toBeVisible();
  });

  test('clicking Settings opens modal', async ({ page }) => {
    await page.click('button[aria-label="User menu"]');
    await page.click('text=Settings');

    // Verify modal opens (Phase 2/3 integration)
    await expect(page.locator('role=dialog')).toBeVisible();
  });

  test('works on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.click('button[aria-label="User menu"]');

    // Verify dropdown not cut off
    const dropdown = page.locator('[role="menu"]');
    const box = await dropdown.boundingBox();
    expect(box.x + box.width).toBeLessThanOrEqual(375);
  });
});
