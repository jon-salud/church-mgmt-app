import { test } from '@playwright/test';
import { LoginPage } from './page-objects/LoginPage';
import { SettingsPage } from './page-objects/SettingsPage';

test.describe('Settings Page', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login();
  });

  test.fixme('renders and passes accessibility check', async ({ page }) => {
    const settingsPage = new SettingsPage(page);

    await test.step('Navigate to settings and verify content', async () => {
      await settingsPage.goto();
      await settingsPage.verifySettingsPage();
    });

    await test.step('Check for accessibility violations', async () => {
      await settingsPage.checkAccessibility();
    });
  });

  test.describe.skip('Request Form Settings', () => {
    test('allows admin to create, update, and archive request types', async ({ page }) => {
      const settingsPage = new SettingsPage(page);

      await test.step('Navigate to settings and verify content', async () => {
        await settingsPage.goto();
        await settingsPage.verifySettingsPage();
      });

      await test.step('Create a new request type', async () => {
        // Implementation to be added by the user
      });

      await test.step('Update the request type', async () => {
        // Implementation to be added by the user
      });

      await test.step('Archive the request type', async () => {
        // Implementation to be added by the user
      });
    });
  });
});
