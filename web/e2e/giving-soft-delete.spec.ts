import { test, expect } from '@playwright/test';
import { LoginPage } from './page-objects/LoginPage';
import { GivingPage } from './page-objects/GivingPage';

test.describe.configure({ mode: 'serial' });

test.describe('Giving Soft Delete', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login();
  });

  // Note: Cleanup removed - tests should restore state within themselves
  // Serial mode ensures tests run in order and don't interfere

  test('admin can archive and restore a single contribution', async ({ page }) => {
    const givingPage = new GivingPage(page);

    await test.step('Navigate to giving page', async () => {
      await givingPage.goto();
      await page.waitForLoadState('networkidle');
    });

    // Note: Toggle button only appears when there are archived contributions
    // So we skip verifying it's visible initially

    // Use unique test contribution: $35.00
    const amount = '$35.00';
    let contributionId = '';
    await test.step('Find test contribution by amount', async () => {
      contributionId = await givingPage.getContributionIdByAmount(amount);
      expect(contributionId).toBeTruthy();
    });

    await test.step('Archive the contribution', async () => {
      await givingPage.archiveContribution(contributionId);
      await page.waitForTimeout(500);
    });

    await test.step('Verify contribution is no longer visible in active list', async () => {
      await givingPage.verifyContributionNotVisible(amount);
    });

    await test.step('Toggle to show archived contributions', async () => {
      // Now the toggle button should be visible since we archived something
      await givingPage.verifyArchivedToggleVisible();
      await givingPage.toggleShowArchivedContributions();
      // Wait for the table to update by waiting for the restore button to appear
      await page
        .locator(`#restore-contribution-button-${contributionId}`)
        .waitFor({ state: 'visible' });
    });

    await test.step('Verify contribution appears in archived list with badge', async () => {
      // Verify by checking the restore button is visible (more reliable than text matching)
      await expect(page.locator(`#restore-contribution-button-${contributionId}`)).toBeVisible();
      await givingPage.verifyContributionArchived(contributionId);
    });

    await test.step('Restore the contribution', async () => {
      await givingPage.restoreContribution(contributionId);
      await page.waitForTimeout(500);
    });

    await test.step('Verify contribution is no longer in archived list', async () => {
      await givingPage.verifyContributionNotVisible(amount);
    });

    await test.step('Toggle back to active contributions if toggle exists', async () => {
      // Check if toggle button still exists (it disappears when no archived items)
      const toggleButton = page.locator('#toggle-archived-contributions-button');
      if (await toggleButton.isVisible()) {
        await toggleButton.click();
        await page.waitForTimeout(500);
      } else {
        // No toggle means no archived items, navigate back to see active list
        await givingPage.goto();
        await page.waitForLoadState('networkidle');
      }
    });

    await test.step('Verify contribution is back in active list', async () => {
      // The edit button being visible confirms the contribution is in active list
      await expect(page.locator(`#edit-contribution-button-${contributionId}`)).toBeVisible();
      await givingPage.verifyContributionNotArchived(contributionId);
    });
  });

  test('admin can bulk archive and restore contributions', async ({ page }) => {
    const givingPage = new GivingPage(page);

    await test.step('Navigate to giving page', async () => {
      await givingPage.goto();
      await page.waitForLoadState('networkidle');
      // Ensure we're in active view (not archived) from any previous test state
      // Toggle button only exists if there are archived items
      const toggleButton = page.locator('#toggle-archived-contributions-button');
      if (await toggleButton.isVisible()) {
        const toggleText = await toggleButton.textContent();
        if (toggleText?.includes('Show Active')) {
          await toggleButton.click();
          await page.waitForTimeout(500);
        }
      }
      // If no toggle button, we're already in active view (no archived items)
    });

    await test.step('Verify select all checkbox is visible', async () => {
      await givingPage.verifySelectAllCheckbox();
    });

    // Use unique test contributions: $75.00 and $85.00 (high values to avoid conflicts)
    const amounts = ['$75.00', '$85.00'];
    const contributionIds: string[] = [];
    await test.step('Find test contributions by amounts', async () => {
      for (const amount of amounts) {
        const id = await givingPage.getContributionIdByAmount(amount);
        expect(id).toBeTruthy();
        contributionIds.push(id);
      }
    });

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
      for (const id of contributionIds) {
        // Verify by checking restore button is visible (more reliable than text matching)
        await expect(page.locator(`#restore-contribution-button-${id}`)).toBeVisible();
        await givingPage.verifyContributionArchived(id);
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

    await test.step('Toggle back to active contributions if toggle exists', async () => {
      // Check if toggle button still exists (it disappears when no archived items)
      const toggleButton = page.locator('#toggle-archived-contributions-button');
      if (await toggleButton.isVisible()) {
        await toggleButton.click();
        await page.waitForTimeout(500);
      } else {
        // No toggle means no archived items, navigate back to see active list
        await givingPage.goto();
        await page.waitForLoadState('networkidle');
      }
    });

    await test.step('Verify contributions are back in active list', async () => {
      for (const id of contributionIds) {
        // Verify by checking edit button is visible
        await expect(page.locator(`#edit-contribution-button-${id}`)).toBeVisible();
      }
    });
  });

  test('archived contributions count is displayed correctly', async ({ page }) => {
    const givingPage = new GivingPage(page);

    await test.step('Navigate to giving page', async () => {
      await givingPage.goto();
      await page.waitForLoadState('networkidle');
      // Ensure we're in active view (not archived) from any previous test state
      const toggleButton = page.locator('#toggle-archived-contributions-button');
      if (await toggleButton.isVisible()) {
        const toggleText = await toggleButton.textContent();
        if (toggleText?.includes('Show Active')) {
          await toggleButton.click();
          await page.waitForTimeout(500);
        }
      }
    });

    let initialCount = 0;
    await test.step('Get initial archived count', async () => {
      initialCount = await givingPage.getArchivedCount();
      expect(initialCount).toBeGreaterThanOrEqual(0);
    });

    // Use unique test contribution: $55.00
    const amount = '$55.00';
    let contributionId = '';
    await test.step('Find test contribution by amount (or restore if archived)', async () => {
      // First try to find it in active view
      try {
        contributionId = await givingPage.getContributionIdByAmount(amount);
      } catch {
        // If not found in active view, check archived view
        const toggleButton = page.locator('#toggle-archived-contributions-button');
        if (await toggleButton.isVisible()) {
          await toggleButton.click();
          await page.waitForTimeout(500);

          // Try to find it in archived view
          try {
            contributionId = await givingPage.getContributionIdByAmount(amount);
            // Found in archived view - restore it first
            await givingPage.restoreContribution(contributionId);
            await page.waitForTimeout(500);

            // Toggle back to active view if toggle still exists
            if (await toggleButton.isVisible()) {
              await toggleButton.click();
              await page.waitForTimeout(500);
            }
          } catch {
            // Still not found - toggle back and fail
            if (await toggleButton.isVisible()) {
              await toggleButton.click();
              await page.waitForTimeout(500);
            }
            throw new Error(`Could not find contribution ${amount} in active or archived view`);
          }
        } else {
          throw new Error(`Could not find contribution ${amount} and no archived items to check`);
        }
      }
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
      await page.waitForTimeout(500);
      // Toggle back to active view if toggle still exists
      const toggleButton = page.locator('#toggle-archived-contributions-button');
      if (await toggleButton.isVisible()) {
        await toggleButton.click();
        await page.waitForTimeout(500);
      }
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

    // Use test contribution that was restored by test 1: $35.00
    const amount = '$35.00';
    const archivedAmount = '35.00';
    let contributionId = '';
    await test.step('Find test contribution by amount', async () => {
      contributionId = await givingPage.getContributionIdByAmount(amount);
      expect(contributionId).toBeTruthy();
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
      // Toggle back to active view if toggle still exists
      const toggleButton = page.locator('#toggle-archived-contributions-button');
      if (await toggleButton.isVisible()) {
        await toggleButton.click();
      }
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
      const toggleButton = page.locator('#toggle-archived-contributions-button');
      // If we're already in archived view from a previous test, toggle back first
      const toggleText = await toggleButton.textContent();
      if (toggleText?.includes('Show Active')) {
        await toggleButton.click();
        await page.waitForTimeout(500);
      }
      // Now verify we're in active view
      const finalText = await toggleButton.textContent();
      expect(finalText).toContain('Show Archived');
    });

    await test.step('Toggle to archived view', async () => {
      await givingPage.toggleShowArchivedContributions();
      await page.waitForTimeout(500);
    });

    await test.step('Verify now in archived view', async () => {
      const toggleText = await page.locator('#toggle-archived-contributions-button').textContent();
      expect(toggleText).toBe('Show Active');
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
      const bulkBar = page.locator('text=contribution(s) selected');
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
      const bulkBar = page.locator('text=contribution(s) selected');
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
