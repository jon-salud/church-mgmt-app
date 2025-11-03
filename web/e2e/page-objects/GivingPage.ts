import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class GivingPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await super.goto('http://localhost:3000/giving');
  }

  // Soft delete methods for contributions
  async toggleShowArchivedContributions() {
    await this.page.locator('#toggle-archived-contributions-button').click();
  }

  async verifyArchivedToggleVisible() {
    await expect(this.page.locator('#toggle-archived-contributions-button')).toBeVisible();
  }

  async archiveContribution(contributionId: string) {
    const responsePromise = this.page.waitForResponse(
      response =>
        response.url().includes(`/giving/contributions/${contributionId}`) &&
        response.request().method() === 'DELETE'
    );
    await this.page.locator(`#archive-contribution-button-${contributionId}`).click();
    // Wait for confirm dialog and accept it
    await this.page.waitForTimeout(100);
    const confirmButton = this.page.locator('button:has-text("Confirm")');
    if (await confirmButton.isVisible({ timeout: 1000 })) {
      await confirmButton.click();
    }
    await responsePromise;
    await this.page.waitForTimeout(200);
  }

  async restoreContribution(contributionId: string) {
    const responsePromise = this.page.waitForResponse(
      response =>
        response.url().includes(`/giving/contributions/${contributionId}/undelete`) &&
        response.request().method() === 'POST'
    );
    await this.page.locator(`#restore-contribution-button-${contributionId}`).click();
    await responsePromise;
    await this.page.waitForTimeout(200);
  }

  async verifyContributionArchived(contributionId: string) {
    const row = this.page.locator(`tr:has(#restore-contribution-button-${contributionId})`);
    await expect(row.getByText('Archived')).toBeVisible();
  }

  async verifyContributionNotArchived(contributionId: string) {
    const row = this.page.locator(`tr:has(#edit-contribution-button-${contributionId})`);
    await expect(row.getByText('Archived')).not.toBeVisible();
  }

  async verifyContributionVisible(amount: string) {
    const table = this.page.locator('table').filter({ hasText: 'Recent contributions' });
    await expect(table.getByText(amount, { exact: true })).toBeVisible();
  }

  async verifyContributionNotVisible(amount: string) {
    const table = this.page.locator('table').filter({ hasText: 'Recent contributions' });
    await expect(table.getByText(amount, { exact: true })).not.toBeVisible();
  }

  async selectContribution(contributionId: string) {
    const checkbox = this.page.locator(`#select-contribution-${contributionId}`);
    await checkbox.check();
  }

  async verifySelectAllCheckbox() {
    await expect(this.page.locator('#select-all-contributions-checkbox')).toBeVisible();
  }

  async selectAllContributions() {
    const checkbox = this.page.locator('#select-all-contributions-checkbox');
    // Force click since the checkbox state might not update immediately
    await checkbox.click({ force: true });
    await this.page.waitForTimeout(200);
  }

  async bulkArchiveContributions() {
    const responsePromise = this.page.waitForResponse(
      response =>
        response.url().includes('/giving/contributions/bulk-delete') &&
        response.request().method() === 'POST'
    );
    await this.page.locator('#bulk-archive-contributions-button').click();
    // Wait for confirm dialog and accept it
    await this.page.waitForTimeout(100);
    const confirmButton = this.page.locator('button:has-text("Confirm")');
    if (await confirmButton.isVisible({ timeout: 1000 })) {
      await confirmButton.click();
    }
    await responsePromise;
    await this.page.waitForTimeout(200);
  }

  async bulkRestoreContributions() {
    const responsePromise = this.page.waitForResponse(
      response =>
        response.url().includes('/giving/contributions/bulk-undelete') &&
        response.request().method() === 'POST'
    );
    await this.page.locator('#bulk-restore-contributions-button').click();
    await responsePromise;
    await this.page.waitForTimeout(200);
  }

  async verifyBulkArchiveButtonVisible() {
    await expect(this.page.locator('#bulk-archive-contributions-button')).toBeVisible();
  }

  async verifyBulkRestoreButtonVisible() {
    await expect(this.page.locator('#bulk-restore-contributions-button')).toBeVisible();
  }

  async getArchivedCount() {
    const buttonText = await this.page
      .locator('#toggle-archived-contributions-button')
      .textContent();
    const match = buttonText?.match(/\((\d+)\)/);
    return match ? parseInt(match[1]) : 0;
  }

  async getTotalGiving() {
    const text = await this.page
      .locator('text=Total giving')
      .locator('..')
      .locator('p')
      .nth(1)
      .textContent();
    return text?.replace(/[$,]/g, '') || '0';
  }

  async getContributionRow(contributionId: string) {
    return this.page.locator(
      `tr:has(#edit-contribution-button-${contributionId}), tr:has(#restore-contribution-button-${contributionId})`
    );
  }

  async getFirstContributionId() {
    // Get the first edit or restore button's ID and extract contribution ID
    const firstButton = this.page
      .locator(
        'button[id^="edit-contribution-button-"], button[id^="restore-contribution-button-"]'
      )
      .first();
    await firstButton.waitFor({ state: 'visible', timeout: 5000 });
    const id = await firstButton.getAttribute('id');
    return (
      id?.replace('edit-contribution-button-', '').replace('restore-contribution-button-', '') || ''
    );
  }
}
