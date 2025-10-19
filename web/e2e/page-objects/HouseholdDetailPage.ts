import { expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class HouseholdDetailPage extends BasePage {
  async verifyHouseholdDetailPage(name: string) {
    await expect(this.page.getByRole('heading', { name })).toBeVisible();
  }
}
