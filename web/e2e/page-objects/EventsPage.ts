import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class EventsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await super.goto('http://localhost:3000/events');
  }

  async scheduleNewEvent(title: string, location: string, startAt: string, endAt: string, tags: string) {
    const scheduleSection = this.page.locator('section', { has: this.page.getByRole('heading', { name: 'Schedule New Event' }) });
    await scheduleSection.getByLabel('Title').fill(title);
    await scheduleSection.getByLabel('Location').fill(location);
    await scheduleSection.getByLabel('Start').fill(startAt);
    await scheduleSection.getByLabel('End').fill(endAt);
    await scheduleSection.getByLabel('Visibility').selectOption('public');
    await scheduleSection.getByLabel('Group (optional)').selectOption('');
    await scheduleSection.getByLabel('Tags (comma separated)').fill(tags);
    await scheduleSection.getByRole('button', { name: 'Create Event' }).click();
  }

  async verifyEventVisible(title: string) {
    await expect(this.page.getByRole('heading', { name: title })).toBeVisible();
  }

  async updateEvent(originalTitle: string, updatedTitle: string, updatedTags: string) {
    const eventCard = this.getEventCard(originalTitle);
    await eventCard.getByText('Edit event details').click();
    const updateEventForm = eventCard.locator('form', { has: this.page.getByRole('button', { name: 'Save Changes' }) });
    await updateEventForm.getByLabel('Title').fill(updatedTitle);
    await updateEventForm.getByLabel('Tags').fill(updatedTags);
    await updateEventForm.getByRole('button', { name: 'Save Changes' }).click();
  }

  async deleteEvent(title: string) {
    const eventCard = this.getEventCard(title);
    await eventCard.getByText('Edit event details').click();
    await eventCard.getByRole('button', { name: 'Delete event' }).click();
  }

  async verifyEventNotVisible(title: string) {
    await expect(this.page.getByRole('heading', { name: title })).toHaveCount(0);
  }

  private getEventCard(title: string) {
    return this.page.locator('article', { has: this.page.getByRole('heading', { name: title }) });
  }
}
