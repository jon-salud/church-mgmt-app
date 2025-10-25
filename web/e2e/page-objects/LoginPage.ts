import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await super.goto('http://localhost:3000/login');
  }

  async login(demoToken = 'demo-admin') {
    // Set the demo token cookie directly to bypass server action issues in Playwright.
    // Playwright currently does not support Next.js 13+ server actions in E2E tests,
    // which prevents us from logging in via the UI as server actions are not executed.
    // See: https://github.com/vercel/next.js/issues/49260 (Next.js server actions and Playwright)
    await this.page.context().addCookies([
      {
        name: 'demo_token',
        value: demoToken,
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
