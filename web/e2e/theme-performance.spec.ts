import { test, expect } from '@playwright/test';
import { LoginPage } from './page-objects/LoginPage';

test.describe('Theme Performance', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login('demo-admin');
  });

  test('theme switching completes quickly', async ({ page }) => {
    await page.goto('http://localhost:3000/settings');
    await page.waitForLoadState('networkidle');

    // Wait for theme cards to be hydrated
    const themeCard = page.locator('button[aria-label*="Select"][aria-label*="theme"]').first();
    await themeCard.waitFor({ state: 'visible', timeout: 15000 });

    // Measure time from click to DOM update
    const warmCard = page.getByRole('button', { name: /select warm accent theme/i });

    const startTime = Date.now();
    await warmCard.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'warm-accent');
    const duration = Date.now() - startTime;

    // Theme switching should be very fast (optimistic UI)
    // Allow up to 250ms to account for CI environment variability and slower machines.
    // 250ms was chosen based on observed timings: locally, theme switching typically completes in 60-120ms,
    // but in CI and on slower hardware, occasional spikes up to ~200ms were observed. The 250ms threshold
    // provides a 25% margin above the highest observed time to reduce test flakiness while still catching regressions.
    expect(duration).toBeLessThan(250);

    // Log actual performance for monitoring
    console.log(`Theme switching took ${duration}ms`);
  });

  test('no FOUC on initial page load', async ({ page }) => {
    // Navigate to a page and check that theme is applied immediately
    await page.goto('http://localhost:3000/dashboard');

    // Theme attribute should be present before page is fully loaded
    const theme = await page.locator('html').getAttribute('data-theme');

    // Verify theme is not empty or undefined
    expect(theme).toBeDefined();
    expect(theme).not.toBe('');
    expect(theme).toBeTruthy();

    // Verify it's a valid theme
    const validThemes = ['original', 'vibrant-blue', 'teal-accent', 'warm-accent'];
    expect(validThemes).toContain(theme);
  });

  test('rapid theme switching handles gracefully', async ({ page }) => {
    // Set up console error monitoring BEFORE theme switching
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('http://localhost:3000/settings');

    // Wait for theme cards
    await page.waitForSelector('button[aria-label*="Select"][aria-label*="theme"]', {
      state: 'visible',
      timeout: 10000,
    });

    // Click through themes rapidly
    const themes = [
      { name: /select vibrant blue theme/i, value: 'vibrant-blue' },
      { name: /select teal accent theme/i, value: 'teal-accent' },
      { name: /select warm accent theme/i, value: 'warm-accent' },
      { name: /select original theme/i, value: 'original' },
    ];

    // Rapid succession clicks
    for (const theme of themes) {
      const card = page.getByRole('button', { name: theme.name });
      await card.click();
      // Small delay to simulate realistic user behavior but still rapid
      await page.waitForTimeout(100);
    }

    // Final theme should be applied (last one wins)
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'original');

    // Wait to catch any async errors
    await page.waitForTimeout(500);

    // Filter for theme-related errors only (exclude known React/library warnings)
    const themeErrors = consoleErrors.filter(
      err =>
        err.includes('theme') &&
        !err.includes('outdated') && // Ignore Next.js version warnings
        !err.includes('Support for defaultProps') && // Ignore react-beautiful-dnd deprecation warnings (covers defaultProps)
        !err.includes('unique "key" prop') && // Ignore React key warnings from drag-drop library
        !err.includes('Prop `%s` did not match') // Ignore React hydration mismatch from drag-drop
    );

    expect(themeErrors).toHaveLength(0);
  });

  test('no layout shift during theme change', async ({ page }) => {
    await page.goto('http://localhost:3000/settings');
    await page.waitForLoadState('networkidle');

    // Wait for theme cards to be hydrated
    const themeCard = page.locator('button[aria-label*="Select"][aria-label*="theme"]').first();
    await themeCard.waitFor({ state: 'visible', timeout: 15000 });

    // Get initial page height
    const initialHeight = await page.evaluate(() => document.body.scrollHeight);

    // Change theme
    const tealCard = page.getByRole('button', { name: /select teal accent theme/i });
    await tealCard.click();

    // Wait for theme to apply
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'teal-accent');

    // Check page height hasn't changed significantly
    const newHeight = await page.evaluate(() => document.body.scrollHeight);
    const heightDiff = Math.abs(newHeight - initialHeight);

    // Allow for minor rendering differences, but no major layout shift
    // 50px tolerance for potential scrollbar changes or minor adjustments
    expect(heightDiff).toBeLessThan(50);
  });
});
