import { test, expect } from '@playwright/test';
import { PastoralCareDashboardPage, NewPastoralCareTicketPage, PastoralCareTicketDetailPage } from './page-objects/pastoral-care.page';

test.describe('Pastoral Care Pages', () => {
  let dashboardPage: PastoralCareDashboardPage;
  let newTicketPage: NewPastoralCareTicketPage;
  let ticketDetailPage: PastoralCareTicketDetailPage;

  test.beforeEach(async ({ page, context }) => {
    // Set the demo token cookie to simulate a logged-in admin user
    await context.addCookies([
      {
        name: 'demo_token',
        value: 'demo-admin',
        url: 'http://localhost:3000',
      },
    ]);

    dashboardPage = new PastoralCareDashboardPage(page);
    newTicketPage = new NewPastoralCareTicketPage(page);
  });

  test('allows a user to create and comment on a pastoral care ticket', async ({ page }) => {
    await dashboardPage.goto();
    await dashboardPage.newTicketButton.click();

    await newTicketPage.titleInput.fill('Test Ticket');
    await newTicketPage.descriptionInput.fill('This is a test ticket description.');
    await newTicketPage.prioritySelect.selectOption('HIGH');
    await newTicketPage.submitButton.click();

    ticketDetailPage = new PastoralCareTicketDetailPage(page);
    await expect(page.getByText('Test Ticket')).toBeVisible();

    await ticketDetailPage.commentTextarea.fill('This is a test comment.');
    await ticketDetailPage.addCommentButton.click();

    await expect(page.getByText('This is a test comment.')).toBeVisible();
  });
});
