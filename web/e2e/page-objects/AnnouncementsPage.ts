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
}
