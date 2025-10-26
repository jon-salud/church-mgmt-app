import { test, expect } from '@playwright/test';

test.describe.fixme('Event Volunteers', () => {
  let eventId: string;

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/events');
    const response = await page.waitForResponse(
      response => response.url().includes('/api/v1/events') && response.status() === 200
    );
    const events = await response.json();
    eventId = events[0].id;
  });

  test('Leader can create and delete volunteer roles', async ({ page }) => {
    await page.click(`#edit-event-button-${eventId}`);

    // Add a volunteer role
    await page.fill('input[placeholder="Role name"]', 'Usher');
    await page.fill('input[placeholder="Needed"]', '4');
    await page.click('button:has-text("Add Role")');
    await expect(page.locator('text=Usher (0/4)')).toBeVisible();

    // Delete the volunteer role
    await page.click('button:has-text("Remove")');
    await expect(page.locator('text=Usher (0/4)')).not.toBeVisible();
  });

  test('Member can sign up for and cancel a volunteer role', async ({ page }) => {
    await page.click(`#edit-event-button-${eventId}`);

    // Add a volunteer role
    await page.fill('input[placeholder="Role name"]', 'Greeter');
    await page.fill('input[placeholder="Needed"]', '2');
    await page.click('button:has-text("Add Role")');
    await expect(page.locator('text=Greeter (0/2)')).toBeVisible();
    await page.click('#edit-cancel-button');

    // Sign up for the role
    await page.click('button:has-text("Sign Up")');
    await expect(page.locator('text=Greeter (1/2)')).toBeVisible();
    await expect(page.locator('button:has-text("Cancel Signup")')).toBeVisible();

    // Cancel the signup
    await page.click('button:has-text("Cancel Signup")');
    await expect(page.locator('text=Greeter (0/2)')).toBeVisible();
    await expect(page.locator('button:has-text("Sign Up")')).toBeVisible();
  });
});
