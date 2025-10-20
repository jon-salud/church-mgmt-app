import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckinPage extends BasePage {
  constructor(page: Page, private memberId: string) {
    super(page);
  }

  async goto() {
    await this.page.goto(`/members/${this.memberId}`);
  }

  async openManageChildrenModal() {
    await this.page.getByRole('button', { name: 'Manage Children' }).click();
    await expect(this.page.getByRole('heading', { name: 'Manage Children' })).toBeVisible();
  }

  async addChild(fullName: string, dateOfBirth: string) {
    await this.page.getByLabel('Full Name').fill(fullName);
    await this.page.getByLabel('Date of Birth').fill(dateOfBirth);
    await this.page.getByRole('button', { name: 'Add Child' }).click();
  }

  async checkinChild(fullName: string) {
    // Implementation to be added
  }

  async verifyChildIsCheckedIn(fullName: string) {
    // Implementation to be added
  }
}
