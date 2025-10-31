import { test, expect } from '@playwright/test';
import { LoginPage } from './page-objects/LoginPage';
import { MembersPage } from './page-objects/MembersPage';

test.describe('Child Check-In', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login('demo-admin'); // Use admin token for check-in functionality access
  });

  test('staff can access member profiles for check-in', async ({ page }) => {
    // Test is blocked by authentication state not being properly transferred to direct page navigation
    // The LoginPage.login() method sets cookies but direct navigation to /members doesn't receive auth
    // Will be enabled once the following issues are resolved:
    // - Authentication context not maintained across page navigation in E2E tests
    // - Members directory page not rendering content after auth
    // - Check-in workflow API integration
    const membersPage = new MembersPage(page);

    await test.step('Navigate to members page', async () => {
      await membersPage.goto();
      // Wait for page to fully load
      await page.waitForLoadState('networkidle');
      // Verify we're on the members page
      await expect(page.locator('h1').filter({ hasText: 'Member Directory' })).toBeVisible();
    });

    await test.step('Navigate to a member profile', async () => {
      // Navigate to a specific member's profile
      await page.goto(`/members/user-1`);
      // Verify we're on a member profile page (should show member details)
      await expect(page.locator('h1')).toBeVisible();
    });

    // Note: Full child management and check-in flow requires additional
    // backend API work and event management. This test verifies basic
    // member profile access for staff performing check-in duties.
    // TODO: Implement full check-in flow once event and child management APIs are complete
  });
});
