import { expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {
  async goto() {
    await super.goto('http://localhost:3000/dashboard');
  }

  async verifyDashboard() {
    await expect(this.page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await expect(this.page.getByTestId('stat-members')).toBeVisible();
  }
}
