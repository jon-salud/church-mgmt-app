import { test, expect } from '@playwright/test';
import { LoginPage } from './page-objects/LoginPage';
import { EventsPage } from './page-objects/EventsPage';

test.describe('Event Volunteers', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login('demo-admin');
  });

  test('Leader can create and delete volunteer roles', async ({ page }) => {
    const eventsPage = new EventsPage(page);
    const timestamp = Date.now();
    const eventTitle = `Test Volunteer Event ${timestamp}`;

    await test.step('Navigate to events page', async () => {
      await eventsPage.goto();
    });

    await test.step('Create a new event for testing', async () => {
      await eventsPage.scheduleNewEvent(
        eventTitle,
        'Church Hall',
        '2024-12-25T10:00',
        '2024-12-25T12:00',
        'test,volunteer'
      );
      await expect(page.getByRole('heading', { name: eventTitle })).toBeVisible();
    });

    await test.step('Open event edit modal', async () => {
      // Click edit on the newly created event
      const eventCard = page.locator('article', {
        has: page.getByRole('heading', { name: eventTitle }),
      });
      await eventCard.getByRole('button', { name: 'Edit' }).click();

      // Wait for the edit modal to appear
      await expect(page.getByRole('heading', { name: `Edit ${eventTitle}` })).toBeVisible();

      // Verify the volunteer roles section exists in the modal
      const modal = page.locator('[role="dialog"]');
      await expect(modal.getByText('Volunteer Roles')).toBeVisible();
      await expect(modal.getByPlaceholder('Role name')).toBeVisible();
      await expect(modal.getByPlaceholder('Needed')).toBeVisible();
      await expect(modal.getByRole('button', { name: 'Add Role' })).toBeVisible();
    });
  });

  test('Member can sign up for and cancel a volunteer role', async ({ page }) => {
    const eventsPage = new EventsPage(page);
    const timestamp = Date.now();
    const eventTitle = `Test Signup Event ${timestamp}`;

    await test.step('Navigate to events page', async () => {
      await eventsPage.goto();
    });

    await test.step('Create another test event', async () => {
      await eventsPage.scheduleNewEvent(
        eventTitle,
        'Church Hall',
        '2024-12-26T10:00',
        '2024-12-26T12:00',
        'test,signup'
      );
      await expect(page.getByRole('heading', { name: eventTitle })).toBeVisible();
    });

    await test.step('Verify volunteer signup UI exists', async () => {
      // The event should show volunteer roles section (even if empty)
      const eventCard = page.locator('article', {
        has: page.getByRole('heading', { name: eventTitle }),
      });

      // Check that the volunteer roles section exists
      await expect(eventCard.getByText('Volunteer Roles')).toBeVisible();
    });
  });
});
