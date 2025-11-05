import { test, expect } from '@playwright/test';
import { LoginPage } from './page-objects/LoginPage';
import { GroupsPage } from './page-objects/GroupsPage';

test.describe('Groups Soft Delete', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login();
  });

  test('admin can archive and restore a single group', async ({ page }) => {
    const groupsPage = new GroupsPage(page);

    await test.step('Navigate to groups page', async () => {
      await groupsPage.goto();
      await page.waitForLoadState('networkidle');
    });

    await test.step('Verify Show Archived toggle is visible for admin', async () => {
      await groupsPage.verifyArchivedToggleVisible();
    });

    await test.step('Get first group name from the list', async () => {
      // Wait for groups to load
      await expect(page.locator('article').first()).toBeVisible();
    });

    // Get the first group's name
    const firstGroupCard = page.locator('article').first();
    const groupName = await firstGroupCard.locator('h2').textContent();
    if (!groupName) throw new Error('No group name found');

    await test.step('Archive the group', async () => {
      await groupsPage.archiveGroup(groupName);
      await page.waitForTimeout(500); // Wait for state update
    });

    await test.step('Verify group is no longer visible in active list', async () => {
      await groupsPage.verifyGroupNotVisible(groupName);
    });

    await test.step('Toggle to show archived groups', async () => {
      await groupsPage.toggleShowArchived();
      await page.waitForTimeout(500);
    });

    await test.step('Verify group appears in archived list with badge', async () => {
      await groupsPage.verifyGroupVisible(groupName);
      await groupsPage.verifyGroupArchived(groupName);
    });

    await test.step('Restore the group', async () => {
      await groupsPage.restoreGroup(groupName);
    });

    await test.step('Verify group is no longer in archived list', async () => {
      await groupsPage.verifyGroupNotVisible(groupName);
    });

    await test.step('Toggle back to active groups', async () => {
      await groupsPage.toggleShowArchived();
      await page.waitForTimeout(500);
    });

    await test.step('Verify group is back in active list', async () => {
      await groupsPage.verifyGroupVisible(groupName);
      await groupsPage.verifyGroupNotArchived(groupName);
    });
  });

  test('admin can bulk archive and restore groups', async ({ page }) => {
    const groupsPage = new GroupsPage(page);

    await test.step('Navigate to groups page', async () => {
      await groupsPage.goto();
      await page.waitForLoadState('networkidle');
    });

    await test.step('Verify select all checkbox is visible', async () => {
      await groupsPage.verifySelectAllCheckbox();
    });

    // Get first two group names
    const groupCards = page.locator('article');
    const groupCount = await groupCards.count();
    if (groupCount < 2) throw new Error('Need at least 2 groups for bulk test');

    const groupNames: string[] = [];
    for (let i = 0; i < Math.min(2, groupCount); i++) {
      const name = await groupCards.nth(i).locator('h2').textContent();
      if (name) groupNames.push(name);
    }

    await test.step('Select multiple groups', async () => {
      for (const name of groupNames) {
        await groupsPage.selectGroup(name);
      }
      await page.waitForTimeout(300);
    });

    await test.step('Verify bulk archive button is visible', async () => {
      await groupsPage.verifyBulkArchiveButtonVisible();
    });

    await test.step('Bulk archive selected groups', async () => {
      await groupsPage.bulkArchiveGroups();
      await page.waitForTimeout(500);
    });

    await test.step('Verify groups are no longer in active list', async () => {
      for (const name of groupNames) {
        await groupsPage.verifyGroupNotVisible(name);
      }
    });

    await test.step('Toggle to show archived groups', async () => {
      await groupsPage.toggleShowArchived();
      await page.waitForTimeout(500);
    });

    await test.step('Verify groups appear in archived list', async () => {
      for (const name of groupNames) {
        await groupsPage.verifyGroupVisible(name);
        await groupsPage.verifyGroupArchived(name);
      }
    });

    await test.step('Select archived groups for restore', async () => {
      for (const name of groupNames) {
        await groupsPage.selectGroup(name);
      }
      await page.waitForTimeout(300);
    });

    await test.step('Verify bulk restore button is visible', async () => {
      await groupsPage.verifyBulkRestoreButtonVisible();
    });

    await test.step('Bulk restore selected groups', async () => {
      await groupsPage.bulkRestoreGroups();
      await page.waitForTimeout(500);
    });

    await test.step('Verify groups are no longer in archived list', async () => {
      for (const name of groupNames) {
        await groupsPage.verifyGroupNotVisible(name);
      }
    });

    await test.step('Toggle back to active groups', async () => {
      await groupsPage.toggleShowArchived();
      await page.waitForTimeout(500);
    });

    await test.step('Verify groups are back in active list', async () => {
      for (const name of groupNames) {
        await groupsPage.verifyGroupVisible(name);
      }
    });
  });

  test('archived groups count is displayed correctly', async ({ page }) => {
    const groupsPage = new GroupsPage(page);

    await test.step('Navigate to groups page', async () => {
      await groupsPage.goto();
      await page.waitForLoadState('networkidle');
    });

    await test.step('Get initial archived count', async () => {
      const toggleLabel = page.locator('label:has(#show-archived-groups)');
      const labelText = await toggleLabel.textContent();
      expect(labelText).toContain('Show Archived');
      expect(labelText).toMatch(/\(\d+\)/); // Should show count in parentheses
    });

    // Archive one group and verify count increases
    const firstGroupCard = page.locator('article').first();
    const groupName = await firstGroupCard.locator('h2').textContent();
    if (!groupName) throw new Error('No group name found');

    const initialToggleLabel = page.locator('label:has(#show-archived-groups)');
    const initialText = await initialToggleLabel.textContent();
    const initialMatch = initialText?.match(/\((\d+)\)/);
    const initialCount = initialMatch ? parseInt(initialMatch[1]) : 0;

    await test.step('Archive the group', async () => {
      await groupsPage.archiveGroup(groupName);
    });

    await test.step('Verify archived count increased', async () => {
      const updatedToggleLabel = page.locator('label:has(#show-archived-groups)');
      const updatedText = await updatedToggleLabel.textContent();
      const updatedMatch = updatedText?.match(/\((\d+)\)/);
      const updatedCount = updatedMatch ? parseInt(updatedMatch[1]) : 0;
      expect(updatedCount).toBe(initialCount + 1);
    });

    await test.step('Cleanup: Restore the group', async () => {
      await groupsPage.toggleShowArchived();
      await page.waitForTimeout(500);
      await groupsPage.restoreGroup(groupName);
    });
  });
});
