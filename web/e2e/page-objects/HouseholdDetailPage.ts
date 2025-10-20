import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class HouseholdDetailPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async verifyHouseholdDetailPage(name: string) {
    await expect(this.page.getByRole('heading', { name })).toBeVisible();
  }
}
