
import { test, expect } from '@playwright/test';
import { RequestsPage } from './page-objects/RequestsPage';

test.describe('Requests Page', () => {
  test('should allow a member to submit a new request', async ({ page }) => {
    const requestsPage = new RequestsPage(page);
    await requestsPage.navigate();

    await requestsPage.selectRequestType('Suggestion');
    await requestsPage.fillRequestForm('New Youth Group Activity', 'We should organize a hiking trip.');
    await requestsPage.submitRequest();

    await expect(page).toHaveURL('/pastoral-care');
  });
});
