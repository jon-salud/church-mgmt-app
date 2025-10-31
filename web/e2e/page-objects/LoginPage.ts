import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await super.goto('http://localhost:3000/login');
  }

  async login(
    persona: 'demo-admin' | 'demo-leader' | 'demo-member' | 'demo-new-admin' = 'demo-admin',
    skipModalHandling = false
  ) {
    // Navigate to login page
    await this.page.goto('http://localhost:3000/login');
    await this.page.waitForLoadState('load');

    // Select the demo persona from the dropdown
    await this.page.selectOption('#persona-select', persona);

    // Click the demo login button
    await this.page.click('#demo-login-button');

    // Wait for navigation to complete
    await this.page.waitForLoadState('load');

    // Check if we're redirected to dashboard or onboarding
    const currentUrl = this.page.url();
    if (currentUrl.includes('/login')) {
      throw new Error(`Login failed - still on login page: ${currentUrl}`);
    }

    // Handle any modal that might appear (onboarding or other dialogs)
    if (!skipModalHandling) {
      const modal = this.page.locator('div[role="dialog"]');
      if (await modal.isVisible()) {
        // Try to close the modal by clicking escape or finding a close button
        await this.page.keyboard.press('Escape');
        // Wait a bit and check if modal is still there
        await this.page.waitForTimeout(500);
        if (await modal.isVisible()) {
          // If escape didn't work, try clicking the backdrop or close button
          await this.page.locator('div[role="dialog"]').click({ position: { x: 1, y: 1 } });
          await this.page.waitForTimeout(500);
        }
        // If modal is still there, try to find and click any close/skip button
        if (await modal.isVisible()) {
          const closeButton = this.page
            .locator('button')
            .filter({ hasText: /(close|skip|×|cancel)/i })
            .first();
          if (await closeButton.isVisible()) {
            await closeButton.click();
          }
        }
        // Final check - wait for modal to disappear
        await modal.waitFor({ state: 'hidden', timeout: 5000 });
      }
    }
  }
}
