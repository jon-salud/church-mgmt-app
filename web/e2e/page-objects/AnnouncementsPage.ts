import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class AnnouncementsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await super.goto('http://localhost:3000/announcements');
  }

  async verifyAnnouncementsPage() {
    await expect(this.page.getByRole('heading', { name: 'Announcements' })).toBeVisible();
  }

  async verifyAnnouncementsLoaded() {
    // Check that announcements are displayed (at least one should exist from mock data)
    await expect(this.page.locator('article').first()).toBeVisible();
  }

  async createAnnouncement(title: string, body: string, audience: 'all' | 'custom' = 'all') {
    // Click the "New announcement" button
    await this.page.getByRole('button', { name: 'New announcement' }).click();

    // Fill in the form
    await this.page.locator('#create-title-input').fill(title);
    await this.page.locator('#create-body-textarea').fill(body);

    if (audience === 'custom') {
      await this.page.locator('#create-audience-select').selectOption('custom');
      // Select first group if custom audience
      await this.page.locator('#create-groups-select').selectOption({ index: 0 });
    }

    // Submit the form
    await this.page.locator('#create-save-button').click();

    // Wait for the modal to close
    await expect(this.page.locator('[role="dialog"]')).not.toBeVisible();
  }

  async verifyAnnouncementExists(title: string, body: string) {
    // Check that the announcement appears in the list
    await expect(this.page.getByRole('heading', { name: title })).toBeVisible();
    await expect(this.page.getByText(body)).toBeVisible();
  }

  async editAnnouncement(oldTitle: string, newTitle: string, newBody: string) {
    // Find the announcement and click edit
    const announcement = this.page.locator('article').filter({ hasText: oldTitle });
    await announcement.getByRole('button', { name: 'Edit' }).click();

    // Update the form
    await this.page.locator('#edit-title-input').fill(newTitle);
    await this.page.locator('#edit-body-textarea').fill(newBody);

    // Submit the form
    await this.page.locator('#edit-save-button').click();

    // Wait for the modal to close
    await expect(this.page.locator('[role="dialog"]')).not.toBeVisible();
  }

  async markAnnouncementRead(title: string) {
    // Find the announcement and click mark read
    const announcement = this.page.locator('article').filter({ hasText: title });
    await announcement.getByRole('button', { name: 'Mark read' }).click();
  }

  async verifyAnnouncementStatus(
    title: string,
    expectedStatus: 'Published' | 'Scheduled' | 'Expired'
  ) {
    const announcement = this.page.locator('article').filter({ hasText: title });
    await expect(announcement.getByText(expectedStatus)).toBeVisible();
  }
}
