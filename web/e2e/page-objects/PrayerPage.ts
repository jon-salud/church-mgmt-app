import { Page, Locator } from '@playwright/test';
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
}
