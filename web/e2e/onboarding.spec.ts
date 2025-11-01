import { test, expect } from '@playwright/test';
import { LoginPage } from './page-objects/LoginPage';
import { OnboardingPage } from './page-objects/OnboardingPage';

test.describe.serial('Onboarding Wizard', () => {
  test.beforeEach(async ({ page }) => {
    // Reset onboarding status before each test
    try {
      const response = await page.request.put(
        'http://localhost:3001/api/v1/settings/church-onboarding',
        {
          data: { onboardingComplete: false },
          headers: {
            Cookie: 'demo_token=demo-new-admin; session_provider=demo',
            'Content-Type': 'application/json',
          },
          timeout: 5000, // 5 second timeout
        }
      );
      if (!response.ok()) {
        throw new Error(
          `Failed to reset onboarding status: ${response.status()} ${response.statusText()}`
        );
      }
    } catch (error) {
      console.log('Error resetting onboarding status:', error);
      // Continue anyway - the test might still work
    }

    const loginPage = new LoginPage(page);
    await loginPage.login('demo-new-admin', true); // Skip modal handling for onboarding test

    // The onboarding modal should appear automatically after login for new users
    // No need to navigate to a specific page
  });

  test.fixme('completes full onboarding flow', async ({ page }) => {
    // Test is blocked by onboarding API integration issues
    // Will be enabled once the following features are implemented:
    // - Settings API for onboarding status
    // - Branding update endpoints
    // - Role definition API
    // - Team invite functionality
    // - Member import API
    const onboardingPage = new OnboardingPage(page);

    await test.step('Verify onboarding modal appears after login', async () => {
      // The modal should appear automatically after login
      await onboardingPage.verifyOnboardingWizardVisible();
    });

    await test.step('Complete branding step', async () => {
      expect(await onboardingPage.getCurrentStepTitle()).toBe('Welcome & Branding');
      expect(await onboardingPage.getProgressValue()).toBe('25');
      await onboardingPage.fillBrandingStep('https://example.com/logo.png', '#ff0000');
    });

    await test.step('Complete roles step', async () => {
      expect(await onboardingPage.getCurrentStepTitle()).toBe('Define Roles');
      expect(await onboardingPage.getProgressValue()).toBe('50');
      await onboardingPage.fillRolesStep();
    });

    await test.step('Complete team invites step', async () => {
      expect(await onboardingPage.getCurrentStepTitle()).toBe('Invite Core Team');
      expect(await onboardingPage.getProgressValue()).toBe('75');
      await onboardingPage.fillTeamInvitesStep('team-member@example.com');
    });

    await test.step('Complete member import step and finish onboarding', async () => {
      expect(await onboardingPage.getCurrentStepTitle()).toBe('Import Members');
      expect(await onboardingPage.getProgressValue()).toBe('100');
      await onboardingPage.fillMemberImportStep();
      await onboardingPage.clickCompleteSetup();
    });

    await test.step('Verify onboarding completion and modal closes', async () => {
      await onboardingPage.waitForCompletion();
      // Verify the modal has closed and we're back to the main application
      const modal = page.locator('[role="dialog"]');
      await expect(modal).not.toBeVisible();
    });
  });

  test('allows skipping onboarding', async ({ page }) => {
    // Test is blocked by onboarding status API integration
    // Will be enabled once the following is implemented:
    // - Settings API for updating onboarding status
    // - Proper modal state management with API
    const onboardingPage = new OnboardingPage(page);

    await test.step('Verify onboarding modal appears', async () => {
      await onboardingPage.verifyOnboardingWizardVisible();
    });

    await test.step('Skip onboarding', async () => {
      await onboardingPage.clickSkip();
    });

    await test.step('Verify modal closes', async () => {
      await onboardingPage.waitForCompletion();
      const modal = page.locator('[role="dialog"]');
      await expect(modal).not.toBeVisible();
    });
  });

  test('allows navigation between steps', async ({ page }) => {
    const onboardingPage = new OnboardingPage(page);

    await test.step('Verify onboarding modal appears', async () => {
      await onboardingPage.verifyOnboardingWizardVisible();
    });

    await test.step('Navigate forward through steps', async () => {
      // Start at step 1
      expect(await onboardingPage.getCurrentStepTitle()).toBe('Welcome & Branding');

      // Complete branding step to go to step 2
      await onboardingPage.fillBrandingStep();
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

    await test.step('Verify onboarding modal appears', async () => {
      await onboardingPage.verifyOnboardingWizardVisible();
    });

    await test.step('Check initial progress', async () => {
      expect(await onboardingPage.getProgressValue()).toBe('25');
    });

    await test.step('Check progress after each step', async () => {
      // Complete branding step to go to roles step
      await onboardingPage.fillBrandingStep();
      expect(await onboardingPage.getProgressValue()).toBe('50');

      await onboardingPage.clickNext();
      expect(await onboardingPage.getProgressValue()).toBe('75');

      await onboardingPage.clickNext();
      expect(await onboardingPage.getProgressValue()).toBe('100');
    });
  });
});
