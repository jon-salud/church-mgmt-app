import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckinDashboardPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await super.goto('http://localhost:3000/checkin/dashboard');
  }

  async verifyCheckinDashboardPage() {
    await expect(this.page.getByRole('heading', { name: 'Child Check-In' })).toBeVisible();
  }

  async verifyPendingSection() {
    await expect(this.page.getByRole('heading', { name: 'Pending Confirmation' })).toBeVisible();
  }

  async verifyCheckedInSection() {
    await expect(this.page.getByRole('heading', { name: 'Currently Checked-In' })).toBeVisible();
  }

  async getPendingCheckinsCount() {
    const pendingList = this.page.locator('h2:has-text("Pending Confirmation") + ul');
    const items = pendingList
      .locator('li')
      .filter({ hasNotText: 'No children pending confirmation' });
    return await items.count();
  }

  async getCheckedInCount() {
    const checkedInList = this.page.locator('h2:has-text("Currently Checked-In") + ul');
    const items = checkedInList
      .locator('li')
      .filter({ hasNotText: 'No children currently checked in' });
    return await items.count();
  }

  async confirmCheckin(childName: string) {
    const childItem = this.page.locator('li').filter({ hasText: childName });
    await childItem.getByRole('button', { name: 'Confirm' }).click();
  }

  async checkoutChild(childName: string) {
    const childItem = this.page.locator('li').filter({ hasText: childName });
    await childItem.getByRole('button', { name: 'Check-Out' }).click();
  }

  async verifyChildInPending(childName: string) {
    const pendingList = this.page.locator('h2:has-text("Pending Confirmation") + ul');
    await expect(pendingList.getByText(childName)).toBeVisible();
  }

  async verifyChildInCheckedIn(childName: string) {
    const checkedInList = this.page.locator('h2:has-text("Currently Checked-In") + ul');
    await expect(checkedInList.getByText(childName)).toBeVisible();
  }

  async verifyChildNotInPending(childName: string) {
    const pendingList = this.page.locator('h2:has-text("Pending Confirmation") + ul');
    await expect(pendingList.getByText(childName)).not.toBeVisible();
  }

  async verifyChildNotInCheckedIn(childName: string) {
    const checkedInList = this.page.locator('h2:has-text("Currently Checked-In") + ul');
    await expect(checkedInList.getByText(childName)).not.toBeVisible();
  }
}
