import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await super.goto('http://localhost:3000/login');
  }

  async login() {
    await this.goto();
    await this.page
      .getByRole('button', { name: 'Explore demo mode (uses seeded admin session)' })
      .click();
    await this.page.waitForURL('**/dashboard');
  }
}
