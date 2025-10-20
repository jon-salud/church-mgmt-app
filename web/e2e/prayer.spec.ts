import { test } from '@playwright/test';
import { PrayerPage } from './page-objects/PrayerPage';

test.describe('Prayer Wall Pages', () => {
  test('prayer wall passes accessibility scan', async ({ page }) => {
    const prayerPage = new PrayerPage(page);
    await prayerPage.goto();
    await prayerPage.checkAccessibility();
  });

  test('new prayer request page passes accessibility scan', async ({ page }) => {
    const prayerPage = new PrayerPage(page);
    await prayerPage.gotoNew();
    await prayerPage.checkAccessibility();
  });

  test('admin moderation page passes accessibility scan', async ({ page }) => {
    const prayerPage = new PrayerPage(page);
    await prayerPage.gotoAdmin();
    await prayerPage.checkAccessibility();
  });
});
