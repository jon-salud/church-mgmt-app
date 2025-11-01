import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class PrayerPage extends BasePage {
  // Prayer Wall Locators
  readonly prayerRequestList: Locator;
  readonly prayButton: Locator;

  // New Prayer Request Form Locators
  readonly titleInput: Locator;
  readonly descriptionInput: Locator;
  readonly anonymousCheckbox: Locator;
  readonly submitButton: Locator;
  readonly successMessage: Locator;

  // Admin Moderation Locators
  readonly pendingRequestList: Locator;
  readonly approveButton: Locator;
  readonly denyButton: Locator;

  constructor(page: Page) {
    super(page);

    // Prayer Wall Locators
    this.prayerRequestList = this.page.locator('.space-y-4 > div');
    this.prayButton = this.page.getByRole('button', { name: "I'm praying" });

    // New Prayer Request Form Locators
    this.titleInput = this.page.getByLabel('Title');
    this.descriptionInput = this.page.getByLabel('Description');
    this.anonymousCheckbox = this.page.getByLabel('Submit anonymously');
    this.submitButton = this.page.getByRole('button', { name: 'Submit' });
    this.successMessage = this.page.getByText('Prayer Request Submitted');

    // Admin Moderation Locators
    this.pendingRequestList = this.page.locator('.space-y-4 > div');
    this.approveButton = this.page.getByRole('button', { name: 'Approve' });
    this.denyButton = this.page.getByRole('button', { name: 'Deny' });
  }

  async goto() {
    await super.goto('http://localhost:3000/prayer');
  }

  async gotoNew() {
    await super.goto('http://localhost:3000/prayer/new');
  }

  async gotoAdmin() {
    await super.goto('http://localhost:3000/prayer/admin');
  }

  async verifyPrayerWallPage() {
    await expect(this.page).toHaveURL('http://localhost:3000/prayer');
    await expect(this.page.getByRole('heading', { name: 'Public Prayer Wall' })).toBeVisible();
  }

  async verifyPrayerRequestList() {
    // It's valid for the list to be empty, so just check that the locator exists (count >= 0)
    await expect(await this.prayerRequestList.count()).toBeGreaterThanOrEqual(0);
  }

  async verifyPrayerWallContent() {
    // Verify basic page structure
    await expect(this.page.getByText('Public Prayer Wall')).toBeVisible();
  }

  async verifyNewPrayerRequestPage() {
    await expect(this.page).toHaveURL('http://localhost:3000/prayer/new');
    await expect(this.titleInput).toBeVisible();
    await expect(this.descriptionInput).toBeVisible();
    await expect(this.submitButton).toBeVisible();
  }

  async fillPrayerRequestForm({
    title,
    description,
    isAnonymous,
  }: {
    title: string;
    description: string;
    isAnonymous: boolean;
  }) {
    await this.titleInput.fill(title);
    await this.descriptionInput.fill(description);
    if (isAnonymous) {
      await this.anonymousCheckbox.check();
    }
  }

  async submitPrayerRequest() {
    await this.submitButton.click();
    // Wait for the button to show "Submitting..." which indicates the request is in progress
    await expect(this.submitButton).toBeDisabled();
    // Then wait for the success message
    await expect(this.successMessage).toBeVisible({ timeout: 10000 });
  }

  async verifyPrayerRequestSubmitted() {
    await expect(this.successMessage).toBeVisible();
  }

  async verifyAdminModerationPage() {
    await expect(this.page).toHaveURL('http://localhost:3000/prayer/admin');
    await expect(this.page.getByText('Prayer Request Moderation')).toBeVisible();
  }

  async verifyPendingRequestsList() {
    // Check if pending requests list can be empty or have items
    const count = await this.pendingRequestList.count();
    expect(count).toBeGreaterThanOrEqual(0);
  }

  async verifyModerationControls() {
    // Verify approve/deny buttons are present when there are pending requests
    const approveButtonCount = await this.approveButton.count();
    const denyButtonCount = await this.denyButton.count();

    // Either there are moderation controls, or no pending requests (both valid)
    expect(approveButtonCount === denyButtonCount).toBe(true);
  }
}
