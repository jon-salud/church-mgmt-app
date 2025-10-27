import { test, expect } from '@playwright/test';
import { PrayerPage } from './page-objects/PrayerPage';
import { RequestsPage } from './page-objects/RequestsPage';

test.describe('Prayer Requests and General Requests', () => {
  test.describe('Prayer Wall', () => {
    test('should allow users to view the public prayer wall', async ({ page }) => {
      const prayerPage = new PrayerPage(page);

      await test.step('Navigate to prayer wall and verify it loads', async () => {
        await prayerPage.goto();
        await prayerPage.verifyPrayerWallPage();
      });

      await test.step('Verify prayer wall sections are present', async () => {
        await prayerPage.verifyPrayerRequestList();
        await prayerPage.verifyPrayerWallContent();
      });
    });

    test('should allow users to submit a new prayer request', async ({ page }) => {
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

    test('should allow admin to moderate prayer requests', async ({ page }) => {
      const prayerPage = new PrayerPage(page);

      await test.step('Navigate to admin prayer moderation page', async () => {
        await prayerPage.gotoAdmin();
        await prayerPage.verifyAdminModerationPage();
      });

      await test.step('Verify moderation interface is available', async () => {
        await prayerPage.verifyPendingRequestsList();
        await prayerPage.verifyModerationControls();
      });

      // Note: Full moderation flow would require creating a pending request first
      // This test verifies the admin interface is accessible and functional
    });
  });

  test.describe('General Requests Form', () => {
    test('should display the requests form with all request types', async ({ page }) => {
      const requestsPage = new RequestsPage(page);

      await test.step('Navigate to requests page and verify it loads', async () => {
        await requestsPage.goto();
        await requestsPage.verifyRequestsPage();
      });

      await test.step('Verify request type dropdown shows available types', async () => {
        await requestsPage.verifyRequestTypeDropdown();
        const requestTypes = await requestsPage.getAvailableRequestTypes();
        expect(requestTypes.length).toBeGreaterThan(0);
        expect(requestTypes).toContain('Prayer');
        expect(requestTypes).toContain('Benevolence');
      });
    });

    test('should allow users to submit a prayer request through general requests', async ({
      page,
    }) => {
      const requestsPage = new RequestsPage(page);

      await test.step('Navigate to requests page', async () => {
        await requestsPage.goto();
        await requestsPage.verifyRequestsPage();
      });

      await test.step('Select prayer request type and fill form', async () => {
        await requestsPage.selectRequestType('Prayer');
        await requestsPage.verifyPrayerRequestForm();
        await requestsPage.fillRequestForm(
          'Prayer Request via General Form',
          'This prayer request was submitted through the general requests form.',
          true // confidential
        );
      });

      await test.step('Submit the prayer request', async () => {
        await requestsPage.submitRequest();
        await requestsPage.verifyRequestSubmitted();
      });
    });

    test('should show confidential option for prayer requests', async ({ page }) => {
      const requestsPage = new RequestsPage(page);

      await test.step('Navigate to requests page and select prayer type', async () => {
        await requestsPage.goto();
        await requestsPage.selectRequestType('Prayer');
      });

      await test.step('Verify confidential checkbox is available for prayer requests', async () => {
        await requestsPage.verifyConfidentialOptionVisible();
      });
    });

    test('should allow users to submit other types of requests', async ({ page }) => {
      const requestsPage = new RequestsPage(page);

      await test.step('Navigate to requests page', async () => {
        await requestsPage.goto();
        await requestsPage.verifyRequestsPage();
      });

      await test.step('Select benevolence request type and fill form', async () => {
        await requestsPage.selectRequestType('Benevolence');
        await requestsPage.fillRequestForm(
          'Benevolence Request',
          'This is a test benevolence request.',
          false // not confidential
        );
      });

      await test.step('Submit the benevolence request', async () => {
        await requestsPage.submitRequest();
        await requestsPage.verifyRequestSubmitted();
      });
    });
  });
});
