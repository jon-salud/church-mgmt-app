import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class SettingsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await super.goto('http://localhost:3000/settings');
  }

  async verifySettingsPage() {
    await expect(this.page.getByRole('heading', { name: 'Settings' })).toBeVisible();
  }
}
