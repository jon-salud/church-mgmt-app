import { test } from '@playwright/test';
import { RolesPage } from './page-objects/RolesPage';

test.describe('Roles Page', () => {
  test.fixme('renders and passes accessibility check', async ({ page }) => {
    const rolesPage = new RolesPage(page);

    await test.step('Navigate to roles and verify content', async () => {
      await rolesPage.goto();
      await rolesPage.verifyRolesPage();
    });

    await test.step('Check for accessibility violations', async () => {
      await rolesPage.checkAccessibility();
    });
  });
});
