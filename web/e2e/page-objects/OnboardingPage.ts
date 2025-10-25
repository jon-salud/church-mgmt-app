import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class OnboardingPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await super.goto('http://localhost:3000/onboarding');
  }

  async verifyOnboardingWizardVisible() {
    // Check if we're on the onboarding page
    await this.page.waitForURL('**/onboarding');
    const currentUrl = this.page.url();
    console.log('Current URL:', currentUrl);

    // Wait for page to load
    await this.page.waitForLoadState('networkidle');

    // Check for basic HTML structure
    const title = await this.page.title();
    console.log('Page title:', title);

    const hasHtml = (await this.page.locator('html').count()) > 0;
    const hasBody = (await this.page.locator('body').count()) > 0;
    console.log('Has HTML:', hasHtml, 'Has Body:', hasBody);

    // Check for any div elements
    const divCount = await this.page.locator('div').count();
    console.log('Number of div elements:', divCount);

    // Check for any text content
    const allText = await this.page.locator('body *').allTextContents();
    console.log(
      'Text content found:',
      allText.length > 0 ? allText.slice(0, 5) : 'No text content'
    );

    // Check if we got redirected (should still be on onboarding)
    if (!currentUrl.includes('/onboarding')) {
      throw new Error(`Redirected away from onboarding page to: ${currentUrl}`);
    }

    // Try to find the welcome text with a more flexible selector
    const welcomeText = this.page.getByText('Welcome to Church Management');
    const isVisible = await welcomeText.isVisible().catch(() => false);
    console.log('Welcome text visible:', isVisible);

    if (!isVisible) {
      // Try to find any text containing "Welcome"
      const welcomeElements = await this.page
        .locator('*')
        .filter({ hasText: /Welcome/i })
        .allTextContents();
      console.log('Elements containing "Welcome":', welcomeElements);
    }

    await expect(welcomeText).toBeVisible();
  }

  async getCurrentStepTitle() {
    return this.page.locator('h2').textContent();
  }

  async getCurrentStepDescription() {
    return this.page.locator('.text-muted-foreground').first().textContent();
  }

  async getProgressValue() {
    const progressBar = this.page.locator('[role="progressbar"]');
    return progressBar.getAttribute('aria-valuenow');
  }

  async clickNext() {
    await this.page.getByRole('button', { name: 'Next' }).click();
  }

  async clickBack() {
    await this.page.getByRole('button', { name: 'Back' }).click();
  }

  async clickSkip() {
    await this.page.getByRole('button', { name: 'Skip for now' }).click();
  }

  async clickCompleteSetup() {
    await this.page.getByRole('button', { name: 'Complete Setup' }).click();
  }

  async waitForCompletion() {
    await this.page.waitForURL('**/dashboard');
  }

  // Branding Step methods
  async fillBrandingStep(logoUrl = '', brandColor = '#3b82f6') {
    if (logoUrl) {
      await this.page.getByLabel('Logo URL (optional)').fill(logoUrl);
    }
    await this.page.getByLabel('Brand Color').fill(brandColor);
    await this.page.getByRole('button', { name: 'Save Branding' }).click();
  }

  // Roles Step methods
  async fillRolesStep() {
    // The roles step has default roles, just click save
    await this.page.getByRole('button', { name: 'Save Roles Configuration' }).click();
  }

  // Team Invites Step methods
  async fillTeamInvitesStep(email = 'team@example.com') {
    await this.page.getByLabel('Email').fill(email);
    await this.page.getByRole('button', { name: 'Add Team Member' }).click();
    // Click send invites if available
    const sendButton = this.page.getByRole('button', { name: /Send.*Invitation/ });
    if (await sendButton.isVisible()) {
      await sendButton.click();
    }
  }

  // Member Import Step methods
  async fillMemberImportStep() {
    // For testing, we can skip the file upload and just proceed
    // The step allows continuing without importing
  }

  async completeFullOnboardingFlow() {
    // Step 1: Branding
    await this.verifyOnboardingWizardVisible();
    expect(await this.getCurrentStepTitle()).toBe('Welcome & Branding');
    await this.fillBrandingStep();
    await this.clickNext();

    // Step 2: Roles
    expect(await this.getCurrentStepTitle()).toBe('Define Roles');
    await this.fillRolesStep();
    await this.clickNext();

    // Step 3: Team Invites
    expect(await this.getCurrentStepTitle()).toBe('Invite Core Team');
    await this.fillTeamInvitesStep();
    await this.clickNext();

    // Step 4: Member Import
    expect(await this.getCurrentStepTitle()).toBe('Import Members');
    await this.fillMemberImportStep();
    await this.clickCompleteSetup();

    // Wait for completion
    await this.waitForCompletion();
  }

  async skipOnboarding() {
    await this.verifyOnboardingWizardVisible();
    await this.clickSkip();
    await this.waitForCompletion();
  }
}
