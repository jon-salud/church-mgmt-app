import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class OnboardingPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    // For modal onboarding, we don't navigate to a dedicated onboarding page.
    // This method is kept for compatibility with older tests but intentionally does not call page.goto.
  }

  async verifyOnboardingWizardVisible() {
    // Wait for the app to reach idle/network-quiescent state
    await this.page.waitForLoadState('networkidle');

    // Wait for the onboarding modal to appear. Use a stable test id for the modal root.
    // This avoids hard-coded timeouts and is more reliable.
    await this.page.waitForSelector('[data-testid="onboarding-modal"]', { timeout: 10000 });
  }
}