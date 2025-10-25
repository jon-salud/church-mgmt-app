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
    // Set the demo token cookie directly to bypass server action issues in Playwright
    await this.page.context().addCookies([
      {
        name: 'demo_token',
        value: 'demo-admin',
        url: 'http://localhost:3000',
      },
      {
        name: 'session_provider',
        value: 'demo',
        url: 'http://localhost:3000',
      },
    ]);

    // Navigate to dashboard to trigger the authentication check
    await this.page.goto('http://localhost:3000/dashboard');
    await this.page.waitForLoadState('networkidle');

    // Check if we're redirected to onboarding or stayed on dashboard
    const currentUrl = this.page.url();
    if (currentUrl.includes('/login')) {
      throw new Error(`Login failed - redirected to login page: ${currentUrl}`);
    }
  }
}
