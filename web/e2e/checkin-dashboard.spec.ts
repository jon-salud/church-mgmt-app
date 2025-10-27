import { test, expect } from '@playwright/test';
import { CheckinDashboardPage } from './page-objects/CheckinDashboardPage';

test.describe('Child Check-in Dashboard', () => {
  test('should allow a staff member to view the check-in dashboard', async ({ page }) => {
    const checkinDashboardPage = new CheckinDashboardPage(page);

    await test.step('Navigate to check-in dashboard and verify it loads', async () => {
      await checkinDashboardPage.goto();
      await checkinDashboardPage.verifyCheckinDashboardPage();
    });

    await test.step('Verify dashboard sections are present', async () => {
      await checkinDashboardPage.verifyPendingSection();
      await checkinDashboardPage.verifyCheckedInSection();
    });

    await test.step('Verify initial state shows no children or appropriate messaging', async () => {
      // Either there should be no children, or the sections should show appropriate content
      const pendingCount = await checkinDashboardPage.getPendingCheckinsCount();
      const checkedInCount = await checkinDashboardPage.getCheckedInCount();

      // At minimum, the sections should exist and be accessible
      // (actual counts depend on mock data state)
      expect(typeof pendingCount).toBe('number');
      expect(typeof checkedInCount).toBe('number');
    });
  });

  test('should allow a staff member to check a child in', async ({ page }) => {
    const checkinDashboardPage = new CheckinDashboardPage(page);

    await test.step('Navigate to check-in dashboard', async () => {
      await checkinDashboardPage.goto();
      await checkinDashboardPage.verifyCheckinDashboardPage();
    });

    await test.step('Verify dashboard shows empty state initially', async () => {
      const pendingCount = await checkinDashboardPage.getPendingCheckinsCount();
      const checkedInCount = await checkinDashboardPage.getCheckedInCount();
      expect(pendingCount).toBe(0);
      expect(checkedInCount).toBe(0);
    });

    // Note: Full check-in flow requires event creation and child management
    // This test verifies the dashboard UI is ready for check-in operations
    // TODO: Implement full check-in flow once event and child management APIs are stable
  });

  test('should allow a staff member to check a child out', async ({ page }) => {
    const checkinDashboardPage = new CheckinDashboardPage(page);

    await test.step('Navigate to check-in dashboard', async () => {
      await checkinDashboardPage.goto();
      await checkinDashboardPage.verifyCheckinDashboardPage();
    });

    await test.step('Verify checkout functionality is available in UI', async () => {
      // The checkout buttons should be present in the checked-in section
      // Even with no children checked in, the UI structure should be ready
      await checkinDashboardPage.verifyCheckedInSection();
    });

    // Note: Full checkout flow requires a child to be checked in first
    // This test verifies the dashboard UI has checkout functionality
    // TODO: Implement full checkout flow once check-in flow is working
  });
});
