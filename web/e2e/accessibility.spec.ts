import { test, expect } from '@playwright/test';
import { DashboardPage } from './page-objects/DashboardPage';
import { MembersPage } from './page-objects/MembersPage';
import { GivingPage } from './page-objects/GivingPage';

test.describe('Accessibility affordances', () => {
  test.fixme('dashboard passes accessibility scan and has skip link', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);

    await test.step('Check dashboard accessibility', async () => {
      await dashboardPage.goto();
      await dashboardPage.checkAccessibility();
    });

    await test.step('Verify skip link functionality', async () => {
      await page.keyboard.press('Tab');
      const skipLink = page.locator('a.skip-link');
      await expect(skipLink).toBeVisible();
      await expect(page.locator('#main-content')).toBeVisible();
    });
  });

  test.fixme('dashboard has labelled navigation landmarks', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);

    await test.step('Navigate to dashboard', async () => {
      await dashboardPage.goto();
    });

    await test.step('Verify navigation landmarks', async () => {
      await expect(page.locator('nav[aria-label="Primary navigation"]')).toBeVisible();
      await expect(page.locator('aside[aria-label="Secondary navigation"]')).toBeVisible();
    });
  });

  test.fixme('member directory passes accessibility scan and has table semantics', async ({ page }) => {
    const membersPage = new MembersPage(page);

    await test.step('Check members page accessibility', async () => {
      await membersPage.goto();
      await membersPage.checkAccessibility();
    });

    await test.step('Verify table semantics', async () => {
      const table = page.locator('table');
      await expect(table.locator('caption')).toHaveText(/members matching/i);
      await expect(table.locator('thead th').first()).toHaveAttribute('scope', 'col');
    });
  });

  test.fixme('giving page passes accessibility scan and has table semantics', async ({ page }) => {
    const givingPage = new GivingPage(page);

    await test.step('Check giving page accessibility', async () => {
      await givingPage.goto();
      await givingPage.checkAccessibility();
    });

    await test.step('Verify table semantics', async () => {
      const table = page.locator('table').first();
      await expect(table.locator('caption')).toHaveText(/manual giving/i);
      await expect(table.locator('thead th').nth(3)).toHaveAttribute('scope', 'col');
    });
  });
});
