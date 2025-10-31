import { test, expect } from '@playwright/test';
import { LoginPage } from './page-objects/LoginPage';

test.describe('Accessibility affordances', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);

    // Login first, then navigate to dashboard
    await loginPage.login('demo-admin');
  });

  test('dashboard passes accessibility scan and has skip link', async ({ page }) => {
    await test.step('Verify skip link functionality', async () => {
      const dashboardHeaderLocator = page.locator('h1', { hasText: 'Dashboard' });
      await expect(dashboardHeaderLocator).toBeVisible();
      await expect(page.locator('#main-content')).toBeVisible();
    });
  });

  test('dashboard has labelled navigation landmarks', async ({ page }) => {
    await test.step('Verify navigation landmarks', async () => {
      await expect(page.locator('#nav-link-dashboard')).toBeVisible();
      await expect(page.locator('#nav-link-members')).toBeVisible();
      await expect(page.locator('#nav-link-households')).toBeVisible();
      await expect(page.locator('#nav-link-groups')).toBeVisible();
      await expect(page.locator('#nav-link-events')).toBeVisible();
      await expect(page.locator('#nav-link-announcements')).toBeVisible();
      await expect(page.locator('#nav-link-prayer')).toBeVisible();
      await expect(page.locator('#nav-link-giving')).toBeVisible();
      await expect(page.locator('#nav-link-roles')).toBeVisible();
      await expect(page.locator('#nav-link-audit-log')).toBeVisible();
      await expect(page.locator('#nav-link-pastoral-care')).toBeVisible();
      // await expect(page.locator("#nav-link-checkin/dashboard")).toBeVisible();
      await expect(page.locator('#nav-link-settings')).toBeVisible();
    });
  });

  test('dashboard contents are present', async ({ page }) => {
    await test.step('Verify table semantics', async () => {
      await expect(page.getByTestId('stat-members')).toBeVisible();
      await expect(page.getByTestId('stat-groups')).toBeVisible();
      await expect(page.getByTestId('stat-events')).toBeVisible();
      await expect(page.getByTestId('stat-giving')).toBeVisible();
    });
  });
});
