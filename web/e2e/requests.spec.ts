import { test, expect } from '@playwright/test';

test.describe('Request Form', () => {
  test.beforeEach(async ({ page: _page }) => {
    // basePage = new BasePage(page);
    // await basePage.loginAs("admin");
  });

  test.skip('request type dropdown shows all active types', async ({ page }) => {
    await page.goto('/requests');
    await page.click('#request-type');
    await expect(page.getByRole('option')).toHaveCount(4); // Four default types
  });

  test.skip('confidential checkbox appears only for appropriate request types', async ({
    page,
  }) => {
    await page.goto('/requests');
    await page.click('#request-type');
    await page.getByText('Prayer').click();
    await expect(page.getByLabel(/confidential/i)).toBeVisible();
  });
});
