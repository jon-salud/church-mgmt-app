import { test, expect } from '@playwright/test';
import { LoginPage } from './page-objects/LoginPage';
import { OnboardingPage } from './page-objects/OnboardingPage';

test.describe.fixme('Onboarding Wizard', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login();

    // If we're redirected to onboarding, continue. If we're on dashboard, navigate to onboarding
    const currentUrl = page.url();
    if (!currentUrl.includes('/onboarding')) {
      // User is already onboarded, navigate to onboarding for testing
      await page.goto('http://localhost:3000/onboarding');
    }
  });

  test('completes full onboarding flow', async ({ page }) => {
    const onboardingPage = new OnboardingPage(page);

    await test.step('Navigate to onboarding and verify wizard appears', async () => {
      await onboardingPage.goto();
      // Check if we're still on onboarding page
      await page.waitForURL('**/onboarding');
      await onboardingPage.verifyOnboardingWizardVisible();
    });

    await test.step('Complete branding step', async () => {
      expect(await onboardingPage.getCurrentStepTitle()).toBe('Welcome & Branding');
      expect(await onboardingPage.getProgressValue()).toBe('25');
      await onboardingPage.fillBrandingStep('https://example.com/logo.png', '#ff0000');
      await onboardingPage.clickNext();
    });

    await test.step('Complete roles step', async () => {
      expect(await onboardingPage.getCurrentStepTitle()).toBe('Define Roles');
      expect(await onboardingPage.getProgressValue()).toBe('50');
      await onboardingPage.fillRolesStep();
      await onboardingPage.clickNext();
    });

    await test.step('Complete team invites step', async () => {
      expect(await onboardingPage.getCurrentStepTitle()).toBe('Invite Core Team');
      expect(await onboardingPage.getProgressValue()).toBe('75');
      await onboardingPage.fillTeamInvitesStep('team-member@example.com');
      await onboardingPage.clickNext();
    });

    await test.step('Complete member import step and finish onboarding', async () => {
      expect(await onboardingPage.getCurrentStepTitle()).toBe('Import Members');
      expect(await onboardingPage.getProgressValue()).toBe('100');
      await onboardingPage.fillMemberImportStep();
      await onboardingPage.clickCompleteSetup();
    });

    await test.step('Verify onboarding completion and redirect to dashboard', async () => {
      await onboardingPage.waitForCompletion();
      // Verify we're on the dashboard
      await page.waitForURL('**/dashboard');
    });
  });

  test('allows skipping onboarding', async ({ page }) => {
    const onboardingPage = new OnboardingPage(page);

    await test.step('Navigate to onboarding', async () => {
      await onboardingPage.goto();
      await onboardingPage.verifyOnboardingWizardVisible();
    });

    await test.step('Skip onboarding', async () => {
      await onboardingPage.clickSkip();
    });

    await test.step('Verify redirect to dashboard', async () => {
      await onboardingPage.waitForCompletion();
      await page.waitForURL('**/dashboard');
    });
  });

  test('allows navigation between steps', async ({ page }) => {
    const onboardingPage = new OnboardingPage(page);

    await test.step('Navigate to onboarding', async () => {
      await onboardingPage.goto();
      await onboardingPage.verifyOnboardingWizardVisible();
    });

    await test.step('Navigate forward through steps', async () => {
      // Start at step 1
      expect(await onboardingPage.getCurrentStepTitle()).toBe('Welcome & Branding');

      // Go to step 2
      await onboardingPage.clickNext();
      expect(await onboardingPage.getCurrentStepTitle()).toBe('Define Roles');

      // Go to step 3
      await onboardingPage.clickNext();
      expect(await onboardingPage.getCurrentStepTitle()).toBe('Invite Core Team');

      // Go to step 4
      await onboardingPage.clickNext();
      expect(await onboardingPage.getCurrentStepTitle()).toBe('Import Members');
    });

    await test.step('Navigate backward through steps', async () => {
      // Go back to step 3
      await onboardingPage.clickBack();
      expect(await onboardingPage.getCurrentStepTitle()).toBe('Invite Core Team');

      // Go back to step 2
      await onboardingPage.clickBack();
      expect(await onboardingPage.getCurrentStepTitle()).toBe('Define Roles');

      // Go back to step 1
      await onboardingPage.clickBack();
      expect(await onboardingPage.getCurrentStepTitle()).toBe('Welcome & Branding');
    });
  });

  test('shows correct progress indicators', async ({ page }) => {
    const onboardingPage = new OnboardingPage(page);

    await test.step('Navigate to onboarding', async () => {
      await onboardingPage.goto();
      await onboardingPage.verifyOnboardingWizardVisible();
    });

    await test.step('Check initial progress', async () => {
      expect(await onboardingPage.getProgressValue()).toBe('25');
    });

    await test.step('Check progress after each step', async () => {
      await onboardingPage.clickNext();
      expect(await onboardingPage.getProgressValue()).toBe('50');

      await onboardingPage.clickNext();
      expect(await onboardingPage.getProgressValue()).toBe('75');

      await onboardingPage.clickNext();
      expect(await onboardingPage.getProgressValue()).toBe('100');
    });
  });
});
