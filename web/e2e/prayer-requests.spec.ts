import { test } from '@playwright/test';
import { PrayerPage } from './page-objects/PrayerPage';

// FIXME: These tests are for the public-facing /prayer/new page
// Need to determine the behavior and requirements for public prayer request submission
// - Should this page be accessible without authentication?
// - What should happen after submission (redirect to prayer wall, show confirmation, etc.)?
// - Should there be moderation workflow for public submissions?
test.describe.fixme('Prayer Requests - Public Form', () => {
  test('should allow users to submit a prayer request on public form', async ({ page }) => {
    const prayerPage = new PrayerPage(page);

    await test.step('Navigate to new prayer request form', async () => {
      await prayerPage.gotoNew();
      await prayerPage.verifyNewPrayerRequestPage();
    });

    await test.step('Fill and submit prayer request form', async () => {
      await prayerPage.fillPrayerRequestForm({
        title: 'Test Prayer Request',
        description: 'This is a test prayer request for automated testing.',
        isAnonymous: false,
      });
      await prayerPage.submitPrayerRequest();
      await prayerPage.verifyPrayerRequestSubmitted();
    });
  });
});
