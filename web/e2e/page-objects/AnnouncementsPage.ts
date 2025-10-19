import { BasePage } from './BasePage';
import { expect } from '@playwright/test';

export class AnnouncementsPage extends BasePage {
  async goto() {
    await super.goto('http://localhost:3000/announcements');
  }

  async verifyAnnouncementsPage() {
    await expect(this.page.getByRole('heading', { name: 'Announcements' })).toBeVisible();
  }
}
