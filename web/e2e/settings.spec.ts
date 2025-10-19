import { test } from '@playwright/test';
import { SettingsPage } from './page-objects/SettingsPage';

test.describe('Settings Page', () => {
  test('renders and passes accessibility check', async ({ page }) => {
    const settingsPage = new SettingsPage(page);

    await test.step('Navigate to settings and verify content', async () => {
      await settingsPage.goto();
      await settingsPage.verifySettingsPage();
    });

    await test.step('Check for accessibility violations', async () => {
      await settingsPage.checkAccessibility();
    });
  });
});
