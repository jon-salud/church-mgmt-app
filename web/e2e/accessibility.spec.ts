import { test, expect } from '@playwright/test';

test.describe('Accessibility affordances', () => {
  test('skip link is focusable and main landmark exists', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    await page.keyboard.press('Tab');
    const skipLink = page.locator('a.skip-link');
    await expect(skipLink).toBeVisible();
    await expect(page.locator('#main-content')).toBeVisible();
  });

  test('primary navigation is labelled', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    await expect(page.locator('nav[aria-label="Primary navigation"]')).toBeVisible();
    await expect(page.locator('aside[aria-label="Secondary navigation"]')).toBeVisible();
  });

  test('member directory table exposes caption and headers', async ({ page }) => {
    await page.goto('http://localhost:3000/members');
    const table = page.locator('table');
    await expect(table.locator('caption')).toHaveText(/members matching/i);
    await expect(table.locator('thead th').first()).toHaveAttribute('scope', 'col');
  });

  test('giving table exposes caption and amount header', async ({ page }) => {
    await page.goto('http://localhost:3000/giving');
    const table = page.locator('table').first();
    await expect(table.locator('caption')).toHaveText(/manual giving/i);
    await expect(table.locator('thead th').nth(3)).toHaveAttribute('scope', 'col');
  });
});
