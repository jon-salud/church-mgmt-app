import { expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class AuditLogPage extends BasePage {
  async goto() {
    await super.goto('http://localhost:3000/audit-log');
  }

  async verifyAuditLog() {
    await expect(this.page.getByRole('heading', { name: 'Audit Log' })).toBeVisible();
    await expect(this.page.getByText('Recent administrative activity', { exact: false })).toBeVisible();
  }
}
