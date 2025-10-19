import { test, expect } from '@playwright/test';

test('households page renders and navigates to detail', async ({ page }) => {
  await page.goto('http://localhost:3000/households');
  await expect(page.getByRole('heading', { name: 'Households' })).toBeVisible();
  await page.getByRole('link', { name: 'Matau Family' }).click();
  await expect(page.getByRole('heading', { name: 'Matau Family' })).toBeVisible();
  await page.screenshot({ path: 'jules-scratch/verification/verification.png' });
});
