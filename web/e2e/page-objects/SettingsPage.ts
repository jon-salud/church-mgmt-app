import { BasePage } from './BasePage';
import { expect } from '@playwright/test';

export class SettingsPage extends BasePage {
  async goto() {
    await super.goto('http://localhost:3000/settings');
  }

  async verifySettingsPage() {
    await expect(this.page.getByRole('heading', { name: 'Settings' })).toBeVisible();
  }
}
