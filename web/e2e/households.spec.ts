import { test, expect } from '@playwright/test';
import { LoginPage } from './page-objects/LoginPage';
import { HouseholdsPage } from './page-objects/HouseholdsPage';
import { HouseholdDetailPage } from './page-objects/HouseholdDetailPage';

test.describe('Households', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login('demo-admin');
  });

  test('households page displays household list and navigates to details', async ({ page }) => {
    const householdsPage = new HouseholdsPage(page);
    const householdDetailPage = new HouseholdDetailPage(page);
    const householdName = 'Matau Family';

    await test.step('Navigate to households page and verify content', async () => {
      await householdsPage.goto();
      await householdsPage.verifyHouseholdsPage();

      // Verify households are displayed with member counts
      await expect(page.getByText('Matau Family')).toBeVisible();
      await expect(page.getByRole('link', { name: 'Matau Family' })).toBeVisible();
    });

    await test.step('Navigate to household detail page and verify content', async () => {
      await householdsPage.navigateToHousehold(householdName);
      await expect(page).toHaveURL(/\/households\/hh-matau/);
      await householdDetailPage.verifyHouseholdDetailPage(householdName);

      // Verify household details are displayed
      await expect(page.getByRole('heading', { name: 'Members' })).toBeVisible();
      await expect(page.getByText(/Head|Spouse|Child/)).toBeVisible(); // Should show household roles
    });
  });
});
