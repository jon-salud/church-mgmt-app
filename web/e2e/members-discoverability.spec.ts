import { test, expect } from '@playwright/test';

// Basic E2E covering search, filter, sort, pagination interactions for Phase 1
// Assumes backend mock data available and demo token accepted.

test.describe('Members Hub Discoverability', () => {
  test.use({
    storageState: {
      cookies: [
        {
          name: 'demo_token',
          value: 'demo-admin',
          domain: 'localhost',
          path: '/',
          // Playwright expects expires as a unix timestamp in SECONDS, not ms
          expires: Math.floor(Date.now() / 1000) + 60 * 60,
          httpOnly: false,
          secure: false,
          sameSite: 'Lax',
        },
      ],
      origins: [],
    },
  });

  test('loads members hub and performs search + sort', async ({ page }) => {
    await page.goto('/members');

    await expect(page.getByRole('heading', { name: 'Members Hub' })).toBeVisible();

    const searchInput = page.locator('input#member-search');
    await searchInput.fill('john');
    // Allow debounce
    await page.waitForTimeout(400);

    // Sort by groups count
    await page.getByText('Groups').click();
    await page.waitForTimeout(100);

    // Pagination controls present (may be disabled if single page)
    await expect(page.locator('button:has-text("Prev")')).toBeVisible();
    await expect(page.locator('button:has-text("Next")')).toBeVisible();

    // Filter by role (if available)
    const roleSelect = page.locator('select').nth(1); // second select (role)
    if (await roleSelect.isVisible()) {
      await roleSelect.selectOption({ value: 'leader' }).catch(() => {});
      await page.waitForTimeout(300);
    }

    // Expect table rows exist
    const rows = page.locator('table tbody tr');
    await expect(rows.first()).toBeVisible();
  });
});
