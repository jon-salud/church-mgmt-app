import { test, expect } from '@playwright/test';
import { PrayerPage } from './page-objects/PrayerPage';

test.describe('Prayer Wall Pages', () => {
  test('prayer wall passes accessibility scan', async ({ page }) => {
    const prayerPage = new PrayerPage(page);
    await prayerPage.goto();
    await prayerPage.checkAccessibility();
  });

  test('new prayer request page passes accessibility scan', async ({ page }) => {
    const prayerPage = new PrayerPage(page);
    await prayerPage.gotoNew();
    await prayerPage.checkAccessibility();
  });

  test('admin moderation page passes accessibility scan', async ({ page }) => {
    const prayerPage = new PrayerPage(page);
    await prayerPage.gotoAdmin();
    await prayerPage.checkAccessibility();
  });

  test.skip('allows a user to submit a new prayer request', async ({ page }) => {
    const prayerPage = new PrayerPage(page);
    await prayerPage.gotoNew();
    await prayerPage.titleInput.fill('Test Prayer Request');
    await prayerPage.descriptionInput.fill('This is a test prayer request.');
    await prayerPage.submitButton.click();
    await expect(prayerPage.successMessage).toBeVisible();
  });

  test.skip('allows an admin to approve a prayer request', async ({ page }) => {
    const prayerPage = new PrayerPage(page);
    await prayerPage.gotoNew();
    await prayerPage.titleInput.fill('Test Prayer Request to Approve');
    await prayerPage.descriptionInput.fill('This is a test prayer request to approve.');
    await prayerPage.submitButton.click();
    await expect(prayerPage.successMessage).toBeVisible();

    await prayerPage.gotoAdmin();
    await prayerPage.approveButton.first().click();

    await prayerPage.goto();
    const prayerRequest = prayerPage.prayerRequestList.filter({ hasText: 'Test Prayer Request to Approve' });
    await expect(prayerRequest).toBeVisible();
  });

  test.skip('allows an admin to deny a prayer request', async ({ page }) => {
    const prayerPage = new PrayerPage(page);
    await prayerPage.gotoNew();
    await prayerPage.titleInput.fill('Test Prayer Request to Deny');
    await prayerPage.descriptionInput.fill('This is a test prayer request to deny.');
    await prayerPage.submitButton.click();
    await expect(prayerPage.successMessage).toBeVisible();

    await prayerPage.gotoAdmin();
    await prayerPage.denyButton.first().click();

    await prayerPage.goto();
    const prayerRequest = prayerPage.prayerRequestList.filter({ hasText: 'Test Prayer Request to Deny' });
    await expect(prayerRequest).not.toBeVisible();
  });
});
