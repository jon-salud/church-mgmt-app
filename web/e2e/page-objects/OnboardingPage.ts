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

  async getCurrentStepTitle(): Promise<string> {
    // Get the current step title from the step header (not the modal title)
    const titleElement = this.page.locator('[data-testid="onboarding-modal"] h2').first();
    return (await titleElement.textContent()) || '';
  }

  async getProgressValue(): Promise<string> {
    // Get the progress from the step text (e.g., "Step 1 of 4" -> "25")
    const stepText = this.page.locator('[data-testid="onboarding-modal"] p.text-sm').first();
    const text = await stepText.textContent();
    if (text) {
      const match = text.match(/Step (\d+) of (\d+)/);
      if (match) {
        const currentStep = parseInt(match[1]);
        const totalSteps = parseInt(match[2]);
        const progress = Math.round((currentStep / totalSteps) * 100);
        return progress.toString();
      }
    }
    return '0';
  }

  async fillBrandingStep(_logoUrl?: string, _primaryColor?: string): Promise<void> {
    // Fill the church name input
    await this.page.fill('#church-name', 'Test Church');

    // Click the Get Started button to proceed
    await this.page.click('button:has-text("Get Started")');
  }

  async fillRolesStep(): Promise<void> {
    // For now, just click next to proceed (roles step might be auto-filled or minimal)
    await this.page.click('button:has-text("Next")');
  }

  async fillTeamInvitesStep(email: string): Promise<void> {
    // Fill the email input for team invites
    await this.page.fill('input[type="email"]', email);

    // Click next to proceed
    await this.page.click('button:has-text("Next")');
  }

  async fillMemberImportStep(): Promise<void> {
    // For member import step, just click complete setup
    await this.page.click('button:has-text("Complete Setup")');
  }

  async clickCompleteSetup(): Promise<void> {
    // Click the complete setup button
    await this.page.click('button:has-text("Complete Setup")');
  }

  async clickSkip(): Promise<void> {
    // Click the skip button
    await this.page.click('button:has-text("Skip for now")');
  }

  async clickNext(): Promise<void> {
    // Click the next button
    await this.page.click('button:has-text("Next")');
  }

  async clickBack(): Promise<void> {
    // Click the back button
    await this.page.click('button:has-text("Back")');
  }

  async waitForCompletion(): Promise<void> {
    // Wait for the modal to close
    await this.page.waitForSelector('[data-testid="onboarding-modal"]', { state: 'hidden' });
  }
}
