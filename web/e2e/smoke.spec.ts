import { test, expect } from '@playwright/test';

test('dashboard renders summary cards', async ({ page }) => {
  await page.goto('http://localhost:3000/dashboard');
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  await expect(page.getByTestId('stat-members')).toBeVisible();
});

test('audit log is visible to admins', async ({ page }) => {
  await page.goto('http://localhost:3000/audit-log');
  await expect(page.getByRole('heading', { name: 'Audit Log' })).toBeVisible();
  await expect(page.getByText('Recent administrative activity', { exact: false })).toBeVisible();
});
