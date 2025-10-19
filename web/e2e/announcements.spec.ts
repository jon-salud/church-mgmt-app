import { test } from '@playwright/test';
import { AnnouncementsPage } from './page-objects/AnnouncementsPage';

test.describe('Announcements Page', () => {
  test('renders and passes accessibility check', async ({ page }) => {
    const announcementsPage = new AnnouncementsPage(page);

    await test.step('Navigate to announcements and verify content', async () => {
      await announcementsPage.goto();
      await announcementsPage.verifyAnnouncementsPage();
    });

    await test.step('Check for accessibility violations', async () => {
      await announcementsPage.checkAccessibility();
    });
  });
});
