import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class MemberDetailPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async verifyMemberName(firstName: string, lastName: string) {
    await expect(this.page.getByRole('heading', { name: `${firstName} ${lastName}` })).toBeVisible();
  }

  async updateMemberDetails(phone: string, address: string) {
    await this.page.getByLabel('Phone').fill(phone);
    await this.page.getByLabel('Address').fill(address);
    await this.page.getByLabel('Status').selectOption('invited');
    await this.page.getByLabel('Role').selectOption({ label: 'Leader' });
    await this.page.getByRole('button', { name: 'Save Changes' }).click();
    await expect(this.page.getByText(`Phone: ${phone}`)).toBeVisible();
  }

  async verifyMemberRole(role: string) {
    const rolesSection = this.page.locator('section', { has: this.page.getByRole('heading', { name: 'Roles' }) });
    await expect(rolesSection.locator('li', { hasText: new RegExp(role) })).toBeVisible();
  }

  async removeMember() {
    await this.page.getByRole('button', { name: 'Remove Member' }).click();
    await this.page.waitForURL('http://localhost:3000/members');
  }

  getMemberIdFromUrl() {
    const url = this.page.url();
    return url.split('/').pop()!;
  }

  async gotoById(memberId: string) {
    await super.goto(`http://localhost:3000/members/${memberId}`);
  }
}
