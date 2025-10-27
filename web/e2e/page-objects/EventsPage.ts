import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class EventsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await super.goto('http://localhost:3000/events');
  }

  async scheduleNewEvent(
    title: string,
    location: string,
    startAt: string,
    endAt: string,
    tags: string
  ) {
    // Click the "Schedule event" button to open the modal
    await this.page.getByRole('button', { name: 'Schedule event' }).click();

    // Wait for the modal to appear
    await expect(this.page.getByRole('heading', { name: 'Schedule event' })).toBeVisible();

    // Fill in the form fields using the correct IDs
    await this.page.fill('#create-title-input', title);
    await this.page.fill('#create-location-input', location);
    await this.page.fill('#create-start-at-input', startAt);
    await this.page.fill('#create-end-at-input', endAt);
    await this.page.selectOption('#create-visibility-select', 'public');
    await this.page.selectOption('#create-group-select', '');
    await this.page.fill('#create-tags-input', tags);

    // Submit the form
    await this.page.click('#create-event-button');

    // Wait for the modal to close
    await expect(this.page.getByRole('heading', { name: 'Schedule event' })).not.toBeVisible();

    // Wait for the event to appear in the list
    await expect(this.page.getByRole('heading', { name: title })).toBeVisible();
  }

  async verifyEventVisible(title: string) {
    await expect(this.page.getByRole('heading', { name: title })).toBeVisible();
  }

  async updateEvent(originalTitle: string, updatedTitle: string, updatedTags: string) {
    const eventCard = this.getEventCard(originalTitle);
    await eventCard.getByText('Edit event details').click();
    const updateEventForm = eventCard.locator('form', {
      has: this.page.getByRole('button', { name: 'Save Changes' }),
    });
    await updateEventForm.getByLabel('Title').fill(updatedTitle);
    await updateEventForm.getByLabel('Tags').fill(updatedTags);
    await updateEventForm.getByRole('button', { name: 'Save Changes' }).click();
  }

  async deleteEvent(title: string) {
    const eventCard = this.getEventCard(title);
    await eventCard.getByText('Edit event details').click();
    await eventCard.getByRole('button', { name: 'Archive Event' }).click();
  }

  async verifyEventNotVisible(title: string) {
    await expect(this.page.getByRole('heading', { name: title })).toHaveCount(0);
  }

  async toggleShowArchived() {
    await this.page.getByLabel('Show archived events').check();
  }

  async verifyEventInArchivedList(title: string) {
    await this.page.getByLabel('Show archived events').check();
    await expect(this.page.getByRole('heading', { name: title })).toBeVisible();
  }

  private getEventCard(title: string) {
    return this.page.locator('article', { has: this.page.getByRole('heading', { name: title }) });
  }
}
