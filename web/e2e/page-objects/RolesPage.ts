import { BasePage } from './BasePage';
import { expect } from '@playwright/test';

export class RolesPage extends BasePage {
  async goto() {
    await super.goto('http://localhost:3000/roles');
  }

  async verifyRolesPage() {
    await expect(this.page.getByRole('heading', { name: 'Roles' })).toBeVisible();
  }
}
