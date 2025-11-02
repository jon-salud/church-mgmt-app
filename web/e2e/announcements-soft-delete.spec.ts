import { test, expect } from '@playwright/test';
import { LoginPage } from './page-objects/LoginPage';
import { AnnouncementsPage } from './page-objects/AnnouncementsPage';

test.describe('Announcements Soft Delete', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login();
  });

  test('admin can archive and restore a single announcement', async ({ page }) => {
    const announcementsPage = new AnnouncementsPage(page);

    await test.step('Navigate to announcements page', async () => {
      await announcementsPage.goto();
      await page.waitForLoadState('networkidle');
    });

    await test.step('Verify Show Archived toggle is visible for admin', async () => {
      await announcementsPage.verifyArchivedToggleVisible();
    });

    await test.step('Get first announcement title from the list', async () => {
      await expect(page.locator('article').first()).toBeVisible();
    });

    // Get the first announcement's title
    const firstAnnouncementCard = page.locator('article').first();
    const announcementTitle = await firstAnnouncementCard.locator('h2').textContent();
    if (!announcementTitle) throw new Error('No announcement title found');

    await test.step('Archive the announcement', async () => {
      await announcementsPage.archiveAnnouncement(announcementTitle);
      await page.waitForTimeout(500); // Wait for state update
    });

    await test.step('Verify announcement is no longer visible in active list', async () => {
      await announcementsPage.verifyAnnouncementNotVisible(announcementTitle);
    });

    await test.step('Toggle to show archived announcements', async () => {
      await announcementsPage.toggleShowArchived();
      await page.waitForTimeout(500);
    });

    await test.step('Verify announcement appears in archived list with badge', async () => {
      await announcementsPage.verifyAnnouncementVisible(announcementTitle);
      await announcementsPage.verifyAnnouncementArchived(announcementTitle);
    });

    await test.step('Restore the announcement', async () => {
      await announcementsPage.restoreAnnouncement(announcementTitle);
      await page.waitForTimeout(500);
    });

    await test.step('Verify announcement is no longer in archived list', async () => {
      await announcementsPage.verifyAnnouncementNotVisible(announcementTitle);
    });

    await test.step('Toggle back to active announcements', async () => {
      await announcementsPage.toggleShowArchived();
      await page.waitForTimeout(500);
    });

    await test.step('Verify announcement is back in active list', async () => {
      await announcementsPage.verifyAnnouncementVisible(announcementTitle);
      await announcementsPage.verifyAnnouncementNotArchived(announcementTitle);
    });
  });

  test('admin can bulk archive and restore announcements', async ({ page }) => {
    const announcementsPage = new AnnouncementsPage(page);

    await test.step('Navigate to announcements page', async () => {
      await announcementsPage.goto();
      await page.waitForLoadState('networkidle');
    });

    await test.step('Verify select all checkbox is visible', async () => {
      await announcementsPage.verifySelectAllCheckbox();
    });

    // Get first two announcement titles
    const announcementCards = page.locator('article');
    const announcementCount = await announcementCards.count();
    if (announcementCount < 2) throw new Error('Need at least 2 announcements for bulk test');

    const announcementTitles: string[] = [];
    for (let i = 0; i < Math.min(2, announcementCount); i++) {
      const title = await announcementCards.nth(i).locator('h2').textContent();
      if (title) announcementTitles.push(title);
    }

    await test.step('Select multiple announcements', async () => {
      for (const title of announcementTitles) {
        await announcementsPage.selectAnnouncement(title);
      }
      await page.waitForTimeout(300);
    });

    await test.step('Verify bulk archive button is visible', async () => {
      await announcementsPage.verifyBulkArchiveButtonVisible();
    });

    await test.step('Bulk archive selected announcements', async () => {
      announcementsPage.confirmBulkAction();
      await announcementsPage.bulkArchiveAnnouncements();
      await page.waitForTimeout(1000);
    });

    await test.step('Verify announcements are no longer in active list', async () => {
      for (const title of announcementTitles) {
        await announcementsPage.verifyAnnouncementNotVisible(title);
      }
    });

    await test.step('Toggle to show archived announcements', async () => {
      await announcementsPage.toggleShowArchived();
      await page.waitForTimeout(500);
    });

    await test.step('Verify announcements appear in archived list', async () => {
      for (const title of announcementTitles) {
        await announcementsPage.verifyAnnouncementVisible(title);
        await announcementsPage.verifyAnnouncementArchived(title);
      }
    });

    await test.step('Select archived announcements for restore', async () => {
      for (const title of announcementTitles) {
        await announcementsPage.selectAnnouncement(title);
      }
      await page.waitForTimeout(300);
    });

    await test.step('Verify bulk restore button is visible', async () => {
      await announcementsPage.verifyBulkRestoreButtonVisible();
    });

    await test.step('Bulk restore selected announcements', async () => {
      announcementsPage.confirmBulkAction();
      await announcementsPage.bulkRestoreAnnouncements();
      await page.waitForTimeout(1000);
    });

    await test.step('Verify announcements are no longer in archived list', async () => {
      for (const title of announcementTitles) {
        await announcementsPage.verifyAnnouncementNotVisible(title);
      }
    });

    await test.step('Toggle back to active announcements', async () => {
      await announcementsPage.toggleShowArchived();
      await page.waitForTimeout(500);
    });

    await test.step('Verify announcements are back in active list', async () => {
      for (const title of announcementTitles) {
        await announcementsPage.verifyAnnouncementVisible(title);
      }
    });
  });

  test('archived announcements count is displayed correctly', async ({ page }) => {
    const announcementsPage = new AnnouncementsPage(page);

    await test.step('Navigate to announcements page', async () => {
      await announcementsPage.goto();
      await page.waitForLoadState('networkidle');
    });

    await test.step('Get initial archived count', async () => {
      const toggleLabel = page.locator('label:has(#show-archived-announcements)');
      const labelText = await toggleLabel.textContent();
      expect(labelText).toContain('Show Archived');
      expect(labelText).toMatch(/\(\d+\)/); // Should show count in parentheses
    });

    // Archive one announcement and verify count increases
    const firstAnnouncementCard = page.locator('article').first();
    const announcementTitle = await firstAnnouncementCard.locator('h2').textContent();
    if (!announcementTitle) throw new Error('No announcement title found');

    const initialToggleLabel = page.locator('label:has(#show-archived-announcements)');
    const initialText = await initialToggleLabel.textContent();
    const initialMatch = initialText?.match(/\((\d+)\)/);
    const initialCount = initialMatch ? parseInt(initialMatch[1]) : 0;

    await test.step('Archive an announcement', async () => {
      await announcementsPage.archiveAnnouncement(announcementTitle);
      await page.waitForTimeout(500);
    });

    await test.step('Verify archived count increased', async () => {
      const updatedToggleLabel = page.locator('label:has(#show-archived-announcements)');
      const updatedText = await updatedToggleLabel.textContent();
      const updatedMatch = updatedText?.match(/\((\d+)\)/);
      const updatedCount = updatedMatch ? parseInt(updatedMatch[1]) : 0;
      expect(updatedCount).toBe(initialCount + 1);
    });

    await test.step('Cleanup: Restore the announcement', async () => {
      await announcementsPage.toggleShowArchived();
      await page.waitForTimeout(500);
      await announcementsPage.restoreAnnouncement(announcementTitle);
    });
  });

  test('archived announcements cannot be edited or marked as read', async ({ page }) => {
    const announcementsPage = new AnnouncementsPage(page);

    await test.step('Navigate to announcements page', async () => {
      await announcementsPage.goto();
      await page.waitForLoadState('networkidle');
    });

    // Get first announcement
    const firstAnnouncementCard = page.locator('article').first();
    const announcementTitle = await firstAnnouncementCard.locator('h2').textContent();
    if (!announcementTitle) throw new Error('No announcement title found');

    await test.step('Archive the announcement', async () => {
      await announcementsPage.archiveAnnouncement(announcementTitle);
      await page.waitForTimeout(500);
    });

    await test.step('Toggle to show archived announcements', async () => {
      await announcementsPage.toggleShowArchived();
      await page.waitForTimeout(500);
    });

    await test.step('Verify Edit and Mark Read buttons are not visible for archived announcement', async () => {
      const archivedCard = page.locator('article').filter({ hasText: announcementTitle });
      await expect(archivedCard.getByRole('button', { name: 'Edit' })).not.toBeVisible();
      await expect(archivedCard.getByRole('button', { name: 'Mark read' })).not.toBeVisible();
    });

    await test.step('Cleanup: Restore the announcement', async () => {
      await announcementsPage.restoreAnnouncement(announcementTitle);
      await page.waitForTimeout(500);
    });
  });
});
