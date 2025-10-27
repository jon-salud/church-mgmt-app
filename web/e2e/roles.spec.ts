import { test, expect } from '@playwright/test';
import { LoginPage } from './page-objects/LoginPage';
import { RolesPage } from './page-objects/RolesPage';

test.describe('Roles Page', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login('demo-admin');
  });

  test('displays roles table and permissions for admins', async ({ page }) => {
    const rolesPage = new RolesPage(page);

    await test.step('Navigate to roles page and verify content', async () => {
      await rolesPage.goto();
      // Verify the correct heading is displayed
      await expect(page.getByRole('heading', { name: 'Roles & Permissions' })).toBeVisible();
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
