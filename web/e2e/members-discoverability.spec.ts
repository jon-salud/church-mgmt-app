import { test, expect } from '@playwright/test';
import { LoginPage } from './page-objects/LoginPage';

// Phase 1 discoverability sanity test.
// Uses LoginPage helper for consistent authentication.

test.describe('Members Hub Discoverability', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login();
  });

  test('loads members hub and performs search + sort', async ({ page }) => {
    await page.goto('http://localhost:3000/members');
    await page.waitForLoadState('domcontentloaded');

    // Guard: ensure we're not redirected to login
    expect(page.url()).not.toContain('/login');

    // Heading should be visible
    await expect(page.getByRole('heading', { name: 'Members Hub' })).toBeVisible();

    // Search input should exist
    const searchInput = page.locator('#member-search');
    await expect(searchInput).toBeVisible();

    // Filter sidebar should exist
    await expect(page.getByText('Filters')).toBeVisible();

    // Table should be present
    await expect(page.locator('table')).toBeVisible();
  });
});
