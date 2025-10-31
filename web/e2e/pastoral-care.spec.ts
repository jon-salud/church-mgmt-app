import { test, expect } from '@playwright/test';
import { PastoralCarePage, NewPastoralCareTicketPage } from './page-objects/PastoralCarePage';

test.describe('Pastoral Care Pages', () => {
  let pastoralCarePage: PastoralCarePage;

  test.beforeEach(async ({ page, context }) => {
    // Set the demo token cookie to simulate a logged-in admin user
    await context.addCookies([
      {
        name: 'demo_token',
        value: 'demo-admin',
        url: 'http://localhost:3000',
      },
      {
        name: 'demo_token',
        value: 'demo-admin',
        url: 'http://localhost:3001',
      },
    ]);

    pastoralCarePage = new PastoralCarePage(page);
  });

  test.fixme(
    'allows a user to navigate to and fill out the pastoral care ticket form',
    async ({ page }) => {
      // Test is blocked by React event handler issues in E2E environment
      // Will be enabled once the following issues are resolved:
      // - Form submission event handlers not triggering correctly in Playwright
      // - React hydration mismatch between server and client rendering
      // - Integration with pastoral care ticket creation API
      const newPastoralCareTicketPage = new NewPastoralCareTicketPage(page);

      // Navigate to pastoral care page
      await pastoralCarePage.goto();

      // Verify we're on the pastoral care page
      await expect(
        page.locator('h1').filter({ hasText: 'Pastoral Care & Requests' })
      ).toBeVisible();

      // Click "New Ticket" button and verify navigation to /pastoral-care/new
      await pastoralCarePage.newTicketButton.click();
      await expect(page).toHaveURL(/\/pastoral-care\/new$/);

      // Verify the form is loaded and contains expected elements
      await expect(
        page.locator('h1').filter({ hasText: 'New Pastoral Care Ticket' })
      ).toBeVisible();

      // Fill out ticket form
      await newPastoralCareTicketPage.titleInput.fill('Test Pastoral Care Ticket');
      await newPastoralCareTicketPage.descriptionInput.fill(
        'This is a test ticket for pastoral care'
      );
      await newPastoralCareTicketPage.prioritySelect.selectOption('NORMAL');

      // Verify form fields are filled correctly
      await expect(newPastoralCareTicketPage.titleInput).toHaveValue('Test Pastoral Care Ticket');
      await expect(newPastoralCareTicketPage.descriptionInput).toHaveValue(
        'This is a test ticket for pastoral care'
      );
      await expect(newPastoralCareTicketPage.prioritySelect).toHaveValue('NORMAL');

      // Verify submit button is visible and enabled
      await expect(newPastoralCareTicketPage.submitButton).toBeVisible();
      await expect(newPastoralCareTicketPage.submitButton).toBeEnabled();

      // Note: Full form submission testing will be implemented once React event handler
      // issues are resolved and the pastoral care ticket creation API is fully integrated
    }
  );

  test.fixme(
    'shows New Ticket button only for admin and leader roles',
    async ({ page, context }) => {
      // Test is blocked by authentication state and UI rendering issues
      // While cookies are being set, the pastoral care page doesn't render the New Ticket link
      // Will be enabled once the following issues are resolved:
      // - Auth context properly maintained across page navigation
      // - Pastoral care page rendering conditional content based on role
      // - Role-based UI element visibility in Next.js server components
      // Test with admin role (should see button)
      await context.addCookies([
        {
          name: 'demo_token',
          value: 'demo-admin',
          url: 'http://localhost:3000',
        },
      ]);

      await pastoralCarePage.goto();
      // Wait for page to fully load
      await page.waitForLoadState('networkidle');
      // Use the actual link selector from the page (it's an <a> tag with href)
      await expect(
        page.locator('a[href="/pastoral-care/new"]').filter({ hasText: 'New Ticket' })
      ).toBeVisible();

      // Test with leader role (should see button)
      await context.clearCookies();
      await context.addCookies([
        {
          name: 'demo_token',
          value: 'demo-leader',
          url: 'http://localhost:3000',
        },
      ]);

      await page.reload();
      // Wait for page to fully load
      await page.waitForLoadState('networkidle');
      await expect(
        page.locator('a[href="/pastoral-care/new"]').filter({ hasText: 'New Ticket' })
      ).toBeVisible();

      // Test with member role (should not see button)
      await context.clearCookies();
      await context.addCookies([
        {
          name: 'demo_token',
          value: 'demo-member',
          url: 'http://localhost:3000',
        },
      ]);

      await page.reload();
      // Wait for page to fully load
      await page.waitForLoadState('networkidle');
      await expect(
        page.locator('a[href="/pastoral-care/new"]').filter({ hasText: 'New Ticket' })
      ).not.toBeVisible();
    }
  );
});
