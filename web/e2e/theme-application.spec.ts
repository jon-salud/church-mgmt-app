import { test, expect } from '@playwright/test';
import { LoginPage } from './page-objects/LoginPage';

test.describe('Theme Application Across Pages', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login('demo-admin');
  });

  test('theme applies consistently across all page types', async ({ page }) => {
    // Navigate to settings and change theme to Vibrant Blue
    await page.goto('http://localhost:3000/settings');

    // Wait for theme cards to be visible (client hydration)
    await page.waitForSelector('button[aria-label*="Select"][aria-label*="theme"]', {
      state: 'visible',
      timeout: 10000,
    });

    const vibrantBlueCard = page.getByRole('button', { name: /select vibrant blue theme/i });
    await vibrantBlueCard.click();

    // Verify theme applied on settings page
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'vibrant-blue');

    // Test theme persistence across different page types
    const pagesToTest = [
      { url: 'http://localhost:3000/dashboard', name: 'Dashboard' },
      { url: 'http://localhost:3000/events', name: 'Events' },
      { url: 'http://localhost:3000/members', name: 'Members' },
      { url: 'http://localhost:3000/groups', name: 'Groups' },
      { url: 'http://localhost:3000/announcements', name: 'Announcements' },
      { url: 'http://localhost:3000/giving', name: 'Giving' },
      { url: 'http://localhost:3000/documents', name: 'Documents' },
    ];

    for (const pageInfo of pagesToTest) {
      await test.step(`Verify theme on ${pageInfo.name} page`, async () => {
        await page.goto(pageInfo.url);
        await expect(page.locator('html')).toHaveAttribute('data-theme', 'vibrant-blue');
      });
    }
  });

  test('theme persists across page reloads', async ({ page }) => {
    // Navigate to settings and set Teal Accent theme
    await page.goto('http://localhost:3000/settings');

    await page.waitForSelector('button[aria-label*="Select"][aria-label*="theme"]', {
      state: 'visible',
      timeout: 10000,
    });

    const tealCard = page.getByRole('button', { name: /select teal accent theme/i });
    await tealCard.click();

    // Verify theme applied
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'teal-accent');

    // Reload page and verify theme persists
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'teal-accent');

    // Navigate to different page and reload
    await page.goto('http://localhost:3000/dashboard');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'teal-accent');

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'teal-accent');
  });

  test('theme change propagates from settings to other pages', async ({ page }) => {
    // Start on Dashboard
    await page.goto('http://localhost:3000/dashboard');
    const initialTheme = await page.locator('html').getAttribute('data-theme');

    // Navigate to settings and change theme
    await page.goto('http://localhost:3000/settings');

    await page.waitForSelector('button[aria-label*="Select"][aria-label*="theme"]', {
      state: 'visible',
      timeout: 10000,
    });

    const warmCard = page.getByRole('button', { name: /select warm accent theme/i });
    await warmCard.click();

    // Verify theme changed
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'warm-accent');

    // Return to Dashboard - theme should persist
    await page.goto('http://localhost:3000/dashboard');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'warm-accent');
    expect(initialTheme).not.toBe('warm-accent'); // Confirm it actually changed
  });

  test('theme applies to detail pages', async ({ page }) => {
    // Set theme first
    await page.goto('http://localhost:3000/settings');

    await page.waitForSelector('button[aria-label*="Select"][aria-label*="theme"]', {
      state: 'visible',
      timeout: 10000,
    });

    const originalCard = page.getByRole('button', { name: /select original theme/i });
    await originalCard.click();

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'original');

    // Navigate to a list page and then detail page
    await page.goto('http://localhost:3000/members');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'original');

    // Click first member to go to detail page
    const firstMember = page.locator('a[href^="/members/"]').first();
    if (await firstMember.isVisible()) {
      await firstMember.click();
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'original');
    }
  });
});
