import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class HouseholdsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await super.goto('http://localhost:3000/households');
  }

  async verifyHouseholdsPage() {
    await expect(this.page.getByRole('heading', { name: 'Households' })).toBeVisible();
  }

  async navigateToHousehold(name: string) {
    await this.page.getByRole('link', { name }).click();
  }
}
