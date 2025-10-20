import { test, expect } from '@playwright/test';
import { BasePage } from './page-objects/BasePage';

test.describe('Child Check-in Dashboard', () => {
  let basePage: BasePage;

  test.beforeEach(async ({ page }) => {
    basePage = new BasePage(page);
    await basePage.goto('/checkin/dashboard');
  });

  test.fixme('should allow a staff member to view the check-in dashboard', async ({ page }) => {
    // TODO: Implement this test
  });

  test.fixme('should allow a staff member to check a child in', async ({ page }) => {
    // TODO: Implement this test
  });

  test.fixme('should allow a staff member to check a child out', async ({ page }) => {
    // TODO: Implement this test
  });
});
