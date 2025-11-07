import { test, expect } from '@playwright/test';
import { LoginPage } from './page-objects/LoginPage';
import { SettingsPage } from './page-objects/SettingsPage';

test.describe('Settings Page', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login('demo-admin');
  });

  test('displays settings form and configuration options for admins', async ({ page }) => {
    const settingsPage = new SettingsPage(page);

    await test.step('Navigate to settings page and verify content', async () => {
      await settingsPage.goto();
      await settingsPage.verifySettingsPage();
    });

    await test.step('Verify settings form is displayed with configuration options', async () => {
      // Check that settings sections are present
      await expect(page.getByRole('heading', { name: 'Request Types' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Profile Fields' })).toBeVisible();

      // Verify some profile field options are displayed
      await expect(page.getByText('Membership Status')).toBeVisible();
      await expect(page.getByText('Join Method')).toBeVisible();
      await expect(page.getByText('Marital Status')).toBeVisible();
    });
  });
});

test.describe('Theme Preferences', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login('demo-admin');
    const settingsPage = new SettingsPage(page);
    await settingsPage.goto();
  });

  test('displays theme preferences section with all 4 theme options', async ({ page }) => {
    await test.step('Verify User Preferences section exists', async () => {
      await expect(page.getByRole('heading', { name: 'User Preferences' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Theme Preferences' })).toBeVisible();
    });

    await test.step('Verify all 4 theme cards are displayed', async () => {
      // Check all theme names are visible
      await expect(page.getByText('Original', { exact: true })).toBeVisible();
      await expect(page.getByText('Vibrant Blue')).toBeVisible();
      await expect(page.getByText('Teal Accent')).toBeVisible();
      await expect(page.getByText('Warm Accent')).toBeVisible();

      // Verify theme descriptions
      await expect(page.getByText('Classic blue-gray theme')).toBeVisible();
      await expect(page.getByText('Bright and energetic')).toBeVisible();
      await expect(page.getByText('Calm and professional')).toBeVisible();
      await expect(page.getByText('Friendly and inviting')).toBeVisible();
    });

    await test.step('Verify theme preview cards have color swatches', async () => {
      // Each theme card should have 3 color preview boxes (background, primary, destructive)
      const colorSwatches = page.locator('[style*="backgroundColor"]');
      const count = await colorSwatches.count();
      expect(count).toBeGreaterThanOrEqual(12); // 4 themes × 3 swatches each
    });
  });

  test('displays dark mode toggle', async ({ page }) => {
    await test.step('Verify dark mode checkbox exists', async () => {
      await expect(page.getByRole('checkbox', { name: /dark mode/i })).toBeVisible();
      await expect(page.getByText('Dark Mode')).toBeVisible();
      await expect(page.getByText('Switch between light and dark appearance')).toBeVisible();
    });
  });

  test('switches theme and updates data-theme attribute', async ({ page }) => {
    await test.step('Select Vibrant Blue theme', async () => {
      // Find and click the Vibrant Blue theme card
      const vibrantBlueCard = page.getByRole('button', { name: /select vibrant blue theme/i });
      await vibrantBlueCard.click();

      // Verify data-theme attribute updated on html element
      const htmlElement = page.locator('html');
      await expect(htmlElement).toHaveAttribute('data-theme', 'vibrant-blue');
    });

    await test.step('Verify selected theme has visual indicator', async () => {
      const vibrantBlueCard = page.getByRole('button', { name: /select vibrant blue theme/i });

      // Check for checkmark SVG (selection indicator)
      const checkmark = vibrantBlueCard.locator('svg[fill="currentColor"]');
      await expect(checkmark).toBeVisible();
    });
  });

  test('switches between all 4 themes sequentially', async ({ page }) => {
    const themes = [
      { name: 'Vibrant Blue', id: 'vibrant-blue' },
      { name: 'Teal Accent', id: 'teal-accent' },
      { name: 'Warm Accent', id: 'warm-accent' },
      { name: 'Original', id: 'original' },
    ];

    for (const theme of themes) {
      await test.step(`Select ${theme.name} theme`, async () => {
        const themeCard = page.getByRole('button', {
          name: new RegExp(`select ${theme.name} theme`, 'i'),
        });
        await themeCard.click();

        // Verify data-theme attribute
        const htmlElement = page.locator('html');
        await expect(htmlElement).toHaveAttribute('data-theme', theme.id);
      });
    }
  });

  test('toggles dark mode and updates class', async ({ page }) => {
    const darkModeCheckbox = page.getByRole('checkbox', { name: /dark mode/i });
    const htmlElement = page.locator('html');

    await test.step('Enable dark mode', async () => {
      const isChecked = await darkModeCheckbox.isChecked();

      if (!isChecked) {
        await darkModeCheckbox.click();
      }

      // Verify dark class is present
      await expect(htmlElement).toHaveClass(/dark/);
    });

    await test.step('Disable dark mode', async () => {
      await darkModeCheckbox.click();

      // Verify dark class is removed
      const classValue = await htmlElement.getAttribute('class');
      expect(classValue).not.toContain('dark');
    });
  });

  test('theme preference persists after page reload', async ({ page }) => {
    await test.step('Select Teal Accent theme', async () => {
      const tealCard = page.getByRole('button', { name: /select teal accent theme/i });

      // Wait for API response
      const responsePromise = page.waitForResponse(
        response => response.url().includes('/settings/theme') && response.status() === 200
      );

      await tealCard.click();
      await responsePromise;
    });

    await test.step('Reload page and verify theme persists', async () => {
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Verify data-theme attribute persisted
      const htmlElement = page.locator('html');
      await expect(htmlElement).toHaveAttribute('data-theme', 'teal-accent');

      // Verify selection indicator still present
      const tealCard = page.getByRole('button', { name: /select teal accent theme/i });
      const checkmark = tealCard.locator('svg[fill="currentColor"]');
      await expect(checkmark).toBeVisible();
    });
  });

  test('dark mode persists after page reload', async ({ page }) => {
    const darkModeCheckbox = page.getByRole('checkbox', { name: /dark mode/i });

    await test.step('Enable dark mode', async () => {
      const isChecked = await darkModeCheckbox.isChecked();
      if (!isChecked) {
        // Wait for API response
        const responsePromise = page.waitForResponse(
          response => response.url().includes('/settings/theme') && response.status() === 200
        );

        await darkModeCheckbox.click();
        await responsePromise;
      }
    });

    await test.step('Reload page and verify dark mode persists', async () => {
      await page.reload();
      await page.waitForLoadState('networkidle');

      const htmlElement = page.locator('html');
      await expect(htmlElement).toHaveClass(/dark/);

      // Verify checkbox still checked
      const reloadedCheckbox = page.getByRole('checkbox', { name: /dark mode/i });
      await expect(reloadedCheckbox).toBeChecked();
    });
  });

  test('theme changes apply to navigation and buttons', async ({ page }) => {
    await test.step('Select Warm Accent theme and verify button colors change', async () => {
      const warmCard = page.getByRole('button', { name: /select warm accent theme/i });
      await warmCard.click();

      // Verify HTML has correct data-theme
      const htmlElement = page.locator('html');
      await expect(htmlElement).toHaveAttribute('data-theme', 'warm-accent');

      // Theme changes should be reflected in CSS variables
      // We can verify by checking computed styles on navigation or buttons
      const computedPrimary = await page.evaluate(() => {
        return window.getComputedStyle(document.documentElement).getPropertyValue('--primary');
      });

      // Warm accent uses orange: hsl(24, 95%, 53%)
      expect(computedPrimary.trim()).toBe('24 95% 53%');
    });
  });

  test('responsive layout: mobile view shows single column', async ({ page }) => {
    await test.step('Resize to mobile viewport', async () => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    });

    await test.step('Verify theme cards stack in single column', async () => {
      // Get all theme cards
      const themeCards = page.locator('button[aria-label*="theme"]');
      const count = await themeCards.count();
      expect(count).toBe(4);

      // Check layout: cards should be stacked vertically
      // Get bounding boxes to verify vertical stacking
      const boxes = [];
      for (let i = 0; i < count; i++) {
        const box = await themeCards.nth(i).boundingBox();
        boxes.push(box);
      }

      // Verify cards are stacked (y positions increase)
      for (let i = 1; i < boxes.length; i++) {
        expect(boxes[i]!.y).toBeGreaterThan(boxes[i - 1]!.y);
      }
    });
  });

  test('keyboard navigation: tab and enter to select theme', async ({ page }) => {
    await test.step('Use keyboard to navigate and select theme', async () => {
      // Focus on first theme card
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab'); // May need multiple tabs depending on page structure

      // Find the currently focused element
      let focusedElement = await page.evaluate(() =>
        document.activeElement?.getAttribute('aria-label')
      );

      // Keep tabbing until we find a theme selection button
      let attempts = 0;
      while (focusedElement && !focusedElement.includes('theme') && attempts < 20) {
        await page.keyboard.press('Tab');
        focusedElement = await page.evaluate(() =>
          document.activeElement?.getAttribute('aria-label')
        );
        attempts++;
      }

      // Press Enter to select the focused theme
      await page.keyboard.press('Enter');

      // Verify a theme was selected (data-theme attribute changed)
      const htmlElement = page.locator('html');
      const dataTheme = await htmlElement.getAttribute('data-theme');
      expect(dataTheme).toBeTruthy();
      expect(['original', 'vibrant-blue', 'teal-accent', 'warm-accent']).toContain(dataTheme);
    });
  });

  test('combination: theme + dark mode work together', async ({ page }) => {
    await test.step('Select Vibrant Blue theme', async () => {
      const vibrantCard = page.getByRole('button', { name: /select vibrant blue theme/i });
      await vibrantCard.click();
    });

    await test.step('Enable dark mode', async () => {
      const darkModeCheckbox = page.getByRole('checkbox', { name: /dark mode/i });
      const isChecked = await darkModeCheckbox.isChecked();
      if (!isChecked) {
        await darkModeCheckbox.click();
      }
    });

    await test.step('Verify both theme and dark mode applied', async () => {
      const htmlElement = page.locator('html');

      // Check data-theme attribute
      await expect(htmlElement).toHaveAttribute('data-theme', 'vibrant-blue');

      // Check dark class
      await expect(htmlElement).toHaveClass(/dark/);
    });

    await test.step('Verify CSS variables applied correctly', async () => {
      const computedPrimary = await page.evaluate(() => {
        return window.getComputedStyle(document.documentElement).getPropertyValue('--primary');
      });

      // Vibrant Blue: hsl(220, 100%, 56%)
      expect(computedPrimary.trim()).toBe('220 100% 56%');
    });
  });

  test('accessibility: ARIA labels and roles', async ({ page }) => {
    await test.step('Verify theme cards have proper ARIA labels', async () => {
      await expect(page.getByRole('button', { name: /select original theme/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /select vibrant blue theme/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /select teal accent theme/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /select warm accent theme/i })).toBeVisible();
    });

    await test.step('Verify dark mode checkbox has label', async () => {
      const darkModeCheckbox = page.getByRole('checkbox', { name: /dark mode/i });
      await expect(darkModeCheckbox).toBeVisible();

      // Verify checkbox has proper labeling
      const labelFor = await page.evaluate(() => {
        const label = document.querySelector('label[for="dark-mode"]');
        return !!label;
      });
      expect(labelFor).toBe(true);
    });
  });

  test('user preferences section is separate from church settings', async ({ page }) => {
    await test.step('Verify both sections exist and are distinct', async () => {
      // User Preferences section
      await expect(page.getByRole('heading', { name: 'User Preferences' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Theme Preferences' })).toBeVisible();

      // Church Settings section (should be below)
      await expect(page.getByRole('heading', { name: 'Church Settings' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Request Types' })).toBeVisible();
    });

    await test.step('Verify church settings still functional', async () => {
      // Check that church settings content is present
      await expect(page.getByText('Membership Status')).toBeVisible();
      await expect(page.getByText('Join Method')).toBeVisible();
    });
  });
});
