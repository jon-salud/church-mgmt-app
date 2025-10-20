import { test } from '@playwright/test';
import { HouseholdsPage } from './page-objects/HouseholdsPage';
import { HouseholdDetailPage } from './page-objects/HouseholdDetailPage';

test.describe('Households', () => {
  test('households page renders, navigates to detail, and passes accessibility checks', async ({ page }) => {
    const householdsPage = new HouseholdsPage(page);
    const householdDetailPage = new HouseholdDetailPage(page);
    const householdName = 'Matau Family';

    await test.step('Navigate to households page and check accessibility', async () => {
      await householdsPage.goto();
      await householdsPage.verifyHouseholdsPage();
      await householdsPage.checkAccessibility();
    });

    await test.step('Navigate to household detail page and check accessibility', async () => {
      await householdsPage.navigateToHousehold(householdName);
      await householdDetailPage.verifyHouseholdDetailPage(householdName);
      await householdDetailPage.checkAccessibility();
    });
  });
});
