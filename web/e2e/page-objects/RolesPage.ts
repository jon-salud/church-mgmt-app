import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class RolesPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await super.goto('http://localhost:3000/roles');
  }

  async verifyRolesPage() {
    await expect(this.page.getByRole('heading', { name: 'Roles' })).toBeVisible();
  }
}
