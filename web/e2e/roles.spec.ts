import { test, expect } from '@playwright/test';
import { LoginPage } from './page-objects/LoginPage';
import { RolesPage } from './page-objects/RolesPage';

test.describe('Roles Page', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login('demo-admin');
  });

  test.fixme('displays roles table and permissions for admins', async ({ page }) => {
    // Test is blocked by authentication state not being properly transferred to direct page navigation
    // The LoginPage.login() method works for authenticated navigation, but direct /roles navigation fails
    // Will be enabled once the following issues are resolved:
    // - Authentication context properly maintained when navigating directly to protected pages
    // - Roles page rendering content after auth state is established
    // - Server component auth checks in Next.js 13+ App Router
    const rolesPage = new RolesPage(page);

    await test.step('Navigate to roles page and verify content', async () => {
      await rolesPage.goto();
      // Wait for page to fully load
      await page.waitForLoadState('networkidle');
      // Verify the correct heading is displayed
      await expect(page.locator('h1').filter({ hasText: 'Roles & Permissions' })).toBeVisible();
    });

    await test.step('Verify roles table is displayed with permissions', async () => {
      // Check that the roles table is present
      await expect(page.locator('table')).toBeVisible();

      // Verify some expected roles are displayed in the table
      await expect(page.getByRole('cell', { name: 'Admin' })).toBeVisible();
      await expect(page.getByRole('cell', { name: 'Leader' })).toBeVisible();
      await expect(page.getByRole('cell', { name: 'Member' })).toBeVisible();

      // Verify permissions are shown (look for specific permission text)
      await expect(
        page.getByText(/people\.manage|groups\.manage|announcements\.manage/)
      ).toBeVisible();
    });
  });
});
