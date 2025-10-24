import { test, expect } from '@playwright/test';
import { BasePage } from './page-objects/BasePage';

test.describe('Request Form', () => {
  let basePage: BasePage;

  test.beforeEach(async ({ page }) => {
    basePage = new BasePage(page);
    await basePage.loginAs('admin');
  });

  test('request type dropdown shows all active types', async ({ page }) => {
    await page.goto('/requests');
    await page.click('#request-type');
    await expect(page.getByRole('option')).toHaveCount(4); // Four default types
  });

  test('confidential checkbox appears only for appropriate request types', async ({ page }) => {
    await page.goto('/requests');
    await page.click('#request-type');
    await page.getByText('Prayer').click();
    await expect(page.getByLabel(/confidential/i)).toBeVisible();
  });
});
