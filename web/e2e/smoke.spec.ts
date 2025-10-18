import { test, expect } from '@playwright/test';

test('login page loads', async ({ page }) => {
  await page.goto('http://localhost:3000/(auth)/login');
  await expect(page.getByText('Login')).toBeVisible();
});
