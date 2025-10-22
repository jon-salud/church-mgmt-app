import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class SettingsPage extends BasePage {
  // Locators for Request Form Settings
  requestFormSettingsHeader = this.page.getByRole('heading', { name: 'Request Form Settings' });
  addRequestTypeButton = this.page.getByRole('button', { name: 'Add Request Type' });
  requestTypeNameInput = this.page.getByPlaceholder('Request type name');
  dialogAddButton = this.page.locator('//div[contains(@class, "DialogFooter")]//button[text()="Add Request Type"]');
  requestTypesList = this.page.locator('//div[contains(@class, "SortableContext")]');

  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await super.goto('http://localhost:3000/settings');
  }

  async verifySettingsPage() {
    await expect(this.page.getByRole('heading', { name: 'Settings' })).toBeVisible();
  }

  getRequestTypeItem(name: string) {
    return this.requestTypesList.locator(`//span[text()="${name}"]`);
  }
}
