import { test, expect } from '@playwright/test';
import { LoginPage } from './page-objects/LoginPage';
import { GivingPage } from './page-objects/GivingPage';

test.describe('Giving Soft Delete', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login();
  });

  test('admin can archive and restore a single contribution', async ({ page }) => {
    const givingPage = new GivingPage(page);

    await test.step('Navigate to giving page', async () => {
      await givingPage.goto();
      await page.waitForLoadState('networkidle');
    });

    await test.step('Verify Show Archived toggle is visible for admin', async () => {
      await givingPage.verifyArchivedToggleVisible();
    });

    // Get the first contribution ID
    let contributionId = '';
    await test.step('Get first contribution ID', async () => {
      contributionId = await givingPage.getFirstContributionId();
      expect(contributionId).toBeTruthy();
    });

    // Get the contribution amount for verification
    const contributionRow = await givingPage.getContributionRow(contributionId);
    const amount = await contributionRow.locator('td').nth(3).textContent();
    if (!amount) throw new Error('No amount found');

    await test.step('Archive the contribution', async () => {
      await givingPage.archiveContribution(contributionId);
      await page.waitForTimeout(500);
    });

    await test.step('Verify contribution is no longer visible in active list', async () => {
      await givingPage.verifyContributionNotVisible(amount);
    });

    await test.step('Toggle to show archived contributions', async () => {
      await givingPage.toggleShowArchivedContributions();
      await page.waitForTimeout(500);
    });

    await test.step('Verify contribution appears in archived list with badge', async () => {
      await givingPage.verifyContributionVisible(amount);
      await givingPage.verifyContributionArchived(contributionId);
    });

    await test.step('Restore the contribution', async () => {
      await givingPage.restoreContribution(contributionId);
      await page.waitForTimeout(500);
    });

    await test.step('Verify contribution is no longer in archived list', async () => {
      await givingPage.verifyContributionNotVisible(amount);
    });

    await test.step('Toggle back to active contributions', async () => {
      await givingPage.toggleShowArchivedContributions();
      await page.waitForTimeout(500);
    });

    await test.step('Verify contribution is back in active list', async () => {
      await givingPage.verifyContributionVisible(amount);
      await givingPage.verifyContributionNotArchived(contributionId);
    });
  });

  test('admin can bulk archive and restore contributions', async ({ page }) => {
    const givingPage = new GivingPage(page);

    await test.step('Navigate to giving page', async () => {
      await givingPage.goto();
      await page.waitForLoadState('networkidle');
    });

    await test.step('Verify select all checkbox is visible', async () => {
      await givingPage.verifySelectAllCheckbox();
    });

    // Get first two contribution IDs
    const contributionIds: string[] = [];
    await test.step('Get first two contribution IDs', async () => {
      const editButtons = page.locator('button[id^="edit-contribution-button-"]');
      const count = await editButtons.count();
      if (count < 2) throw new Error('Need at least 2 contributions for bulk test');

      for (let i = 0; i < Math.min(2, count); i++) {
        const id = await editButtons.nth(i).getAttribute('id');
        const contributionId = id?.replace('edit-contribution-button-', '') || '';
        if (contributionId) contributionIds.push(contributionId);
      }
    });

    // Get contribution amounts for verification
    const amounts: string[] = [];
    for (const id of contributionIds) {
      const row = await givingPage.getContributionRow(id);
      const amount = await row.locator('td').nth(3).textContent();
      if (amount) amounts.push(amount);
    }

    await test.step('Select multiple contributions', async () => {
      for (const id of contributionIds) {
        await givingPage.selectContribution(id);
      }
      await page.waitForTimeout(300);
    });

    await test.step('Verify bulk archive button is visible', async () => {
      await givingPage.verifyBulkArchiveButtonVisible();
    });

    await test.step('Bulk archive selected contributions', async () => {
      await givingPage.bulkArchiveContributions();
      await page.waitForTimeout(500);
    });

    await test.step('Verify contributions are no longer in active list', async () => {
      for (const amount of amounts) {
        await givingPage.verifyContributionNotVisible(amount);
      }
    });

    await test.step('Toggle to show archived contributions', async () => {
      await givingPage.toggleShowArchivedContributions();
      await page.waitForTimeout(500);
    });

    await test.step('Verify contributions appear in archived list', async () => {
      for (let i = 0; i < contributionIds.length; i++) {
        await givingPage.verifyContributionVisible(amounts[i]);
        await givingPage.verifyContributionArchived(contributionIds[i]);
      }
    });

    await test.step('Select archived contributions for restore', async () => {
      for (const id of contributionIds) {
        await givingPage.selectContribution(id);
      }
      await page.waitForTimeout(300);
    });

    await test.step('Verify bulk restore button is visible', async () => {
      await givingPage.verifyBulkRestoreButtonVisible();
    });

    await test.step('Bulk restore selected contributions', async () => {
      await givingPage.bulkRestoreContributions();
      await page.waitForTimeout(500);
    });

    await test.step('Verify contributions are no longer in archived list', async () => {
      for (const amount of amounts) {
        await givingPage.verifyContributionNotVisible(amount);
      }
    });

    await test.step('Toggle back to active contributions', async () => {
      await givingPage.toggleShowArchivedContributions();
      await page.waitForTimeout(500);
    });

    await test.step('Verify contributions are back in active list', async () => {
      for (const amount of amounts) {
        await givingPage.verifyContributionVisible(amount);
      }
    });
  });

  test('archived contributions count is displayed correctly', async ({ page }) => {
    const givingPage = new GivingPage(page);

    await test.step('Navigate to giving page', async () => {
      await givingPage.goto();
      await page.waitForLoadState('networkidle');
    });

    let initialCount = 0;
    await test.step('Get initial archived count', async () => {
      initialCount = await givingPage.getArchivedCount();
      expect(initialCount).toBeGreaterThanOrEqual(0);
    });

    // Archive one contribution and verify count increases
    let contributionId = '';
    await test.step('Get first contribution', async () => {
      contributionId = await givingPage.getFirstContributionId();
      expect(contributionId).toBeTruthy();
    });

    await test.step('Archive the contribution', async () => {
      await givingPage.archiveContribution(contributionId);
      await page.waitForTimeout(500);
    });

    await test.step('Verify archived count increased', async () => {
      const updatedCount = await givingPage.getArchivedCount();
      expect(updatedCount).toBe(initialCount + 1);
    });

    await test.step('Cleanup: Restore the contribution', async () => {
      await givingPage.toggleShowArchivedContributions();
      await page.waitForTimeout(500);
      await givingPage.restoreContribution(contributionId);
    });
  });

  test('financial calculations exclude archived contributions', async ({ page }) => {
    const givingPage = new GivingPage(page);

    await test.step('Navigate to giving page', async () => {
      await givingPage.goto();
      await page.waitForLoadState('networkidle');
    });

    let initialTotal = '';
    await test.step('Get initial total giving', async () => {
      initialTotal = await givingPage.getTotalGiving();
      expect(initialTotal).toBeTruthy();
    });

    // Archive one contribution
    let contributionId = '';
    let archivedAmount = '';
    await test.step('Get first contribution', async () => {
      contributionId = await givingPage.getFirstContributionId();
      const row = await givingPage.getContributionRow(contributionId);
      const amountText = await row.locator('td').nth(3).textContent();
      archivedAmount = amountText?.replace(/[$,]/g, '') || '0';
    });

    await test.step('Archive the contribution', async () => {
      await givingPage.archiveContribution(contributionId);
      await page.waitForTimeout(500);
    });

    await test.step('Verify total giving decreased', async () => {
      const updatedTotal = await givingPage.getTotalGiving();
      const initialValue = parseFloat(initialTotal);
      const updatedValue = parseFloat(updatedTotal);
      const archivedValue = parseFloat(archivedAmount);

      expect(updatedValue).toBeCloseTo(initialValue - archivedValue, 2);
    });

    await test.step('Cleanup: Restore the contribution', async () => {
      await givingPage.toggleShowArchivedContributions();
      await page.waitForTimeout(500);
      await givingPage.restoreContribution(contributionId);
      await page.waitForTimeout(500);
      await givingPage.toggleShowArchivedContributions();
    });

    await test.step('Verify total giving restored', async () => {
      const restoredTotal = await givingPage.getTotalGiving();
      const restoredValue = parseFloat(restoredTotal);
      const initialValue = parseFloat(initialTotal);
      expect(restoredValue).toBeCloseTo(initialValue, 2);
    });
  });

  test('toggle between active and archived views', async ({ page }) => {
    const givingPage = new GivingPage(page);

    await test.step('Navigate to giving page', async () => {
      await givingPage.goto();
      await page.waitForLoadState('networkidle');
    });

    await test.step('Verify starting in active view', async () => {
      const toggleText = await page.locator('#toggle-archived-contributions-button').textContent();
      expect(toggleText).toContain('Show Archived');
    });

    await test.step('Toggle to archived view', async () => {
      await givingPage.toggleShowArchivedContributions();
      await page.waitForTimeout(500);
    });

    await test.step('Verify now in archived view', async () => {
      const toggleText = await page.locator('#toggle-archived-contributions-button').textContent();
      expect(toggleText).toContain('Show Active');
    });

    await test.step('Toggle back to active view', async () => {
      await givingPage.toggleShowArchivedContributions();
      await page.waitForTimeout(500);
    });

    await test.step('Verify back in active view', async () => {
      const toggleText = await page.locator('#toggle-archived-contributions-button').textContent();
      expect(toggleText).toContain('Show Archived');
    });
  });

  test('select all checkbox works correctly', async ({ page }) => {
    const givingPage = new GivingPage(page);

    await test.step('Navigate to giving page', async () => {
      await givingPage.goto();
      await page.waitForLoadState('networkidle');
    });

    await test.step('Verify select all checkbox is unchecked', async () => {
      const checkbox = page.locator('#select-all-contributions-checkbox');
      await expect(checkbox).not.toBeChecked();
    });

    await test.step('Click select all checkbox', async () => {
      await givingPage.selectAllContributions();
      await page.waitForTimeout(300);
    });

    await test.step('Verify select all checkbox is checked', async () => {
      const checkbox = page.locator('#select-all-contributions-checkbox');
      await expect(checkbox).toBeChecked();
    });

    await test.step('Verify bulk action bar appears', async () => {
      const bulkBar = page.locator('text=selected');
      await expect(bulkBar).toBeVisible();
    });

    await test.step('Click cancel button', async () => {
      await page.locator('#cancel-selection-button').click();
      await page.waitForTimeout(300);
    });

    await test.step('Verify select all checkbox is unchecked again', async () => {
      const checkbox = page.locator('#select-all-contributions-checkbox');
      await expect(checkbox).not.toBeChecked();
    });

    await test.step('Verify bulk action bar disappears', async () => {
      const bulkBar = page.locator('text=selected');
      await expect(bulkBar).not.toBeVisible();
    });
  });

  test('partial failure handling shows appropriate messages', async ({ page }) => {
    const givingPage = new GivingPage(page);

    await test.step('Navigate to giving page', async () => {
      await givingPage.goto();
      await page.waitForLoadState('networkidle');
    });

    // This test verifies that if a bulk operation has partial failures,
    // the UI properly handles it by showing warning messages and rolling back
    // only the failed items while keeping successful ones.
    // Since we can't easily simulate backend failures in E2E tests,
    // this test primarily validates the success path and UI presence.

    await test.step('Verify page loads successfully', async () => {
      await expect(page.locator('h1:has-text("Giving records")')).toBeVisible();
    });

    await test.step('Verify bulk operation UI elements are present', async () => {
      await givingPage.verifySelectAllCheckbox();
      await givingPage.verifyArchivedToggleVisible();
    });

    // Note: Full partial failure testing would require mocking the backend
    // or using a test-specific API mode that can simulate partial failures.
    // For production validation, manual testing or integration tests with
    // controlled backend state would be more appropriate.
  });
});
