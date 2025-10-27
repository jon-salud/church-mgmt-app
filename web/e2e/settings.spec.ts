import { test, expect } from '@playwright/test';
import { LoginPage } from './page-objects/LoginPage';
import { SettingsPage } from './page-objects/SettingsPage';

test.describe('Settings Page', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login('demo-admin');
  });

  test('displays settings form and configuration options for admins', async ({ page }) => {
    const settingsPage = new SettingsPage(page);

    await test.step('Navigate to settings page and verify content', async () => {
      await settingsPage.goto();
      await settingsPage.verifySettingsPage();
    });

    await test.step('Verify settings form is displayed with configuration options', async () => {
      // Check that settings sections are present
      await expect(page.getByRole('heading', { name: 'Request Types' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Profile Fields' })).toBeVisible();

      // Verify some profile field options are displayed
      await expect(page.getByText('Membership Status')).toBeVisible();
      await expect(page.getByText('Join Method')).toBeVisible();
      await expect(page.getByText('Marital Status')).toBeVisible();
    });
  });
});
