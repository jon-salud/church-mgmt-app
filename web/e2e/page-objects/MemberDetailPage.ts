import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class MemberDetailPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async verifyMemberName(firstName: string, lastName: string) {
    await expect(
      this.page.getByRole('heading', { name: `${firstName} ${lastName}` })
    ).toBeVisible();
  }

  async updateMemberDetails(phone: string, address: string) {
    // Click the Edit Profile button to open the modal
    await this.page.getByRole('button', { name: 'Edit Profile' }).click();

    // Wait for the modal to open and form fields to be visible
    await this.page.getByLabel('Phone').waitFor({ state: 'visible' });

    await this.page.getByLabel('Phone').fill(phone);
    await this.page.getByLabel('Address').fill(address);
    await this.page.getByLabel('Status').selectOption('invited');
    await this.page.getByLabel('Role').selectOption({ label: 'Leader' });
    await this.page.getByRole('button', { name: 'Save Changes' }).click();
    await expect(this.page.getByText(`Phone: ${phone}`)).toBeVisible();
  }

  async verifyMemberRole(role: string) {
    const rolesSection = this.page.locator('section', {
      has: this.page.getByRole('heading', { name: 'Roles' }),
    });
    await expect(rolesSection.locator('li', { hasText: new RegExp(role) })).toBeVisible();
  }

  async removeMember() {
    // Click "Remove Member" to open the archive modal
    await this.page.getByRole('button', { name: 'Remove Member' }).click();

    // Wait for modal to open
    await this.page.getByRole('dialog', { name: 'Archive Member' }).waitFor({ state: 'visible' });

    // Click "Archive Member" in the modal
    await this.page.getByRole('button', { name: 'Archive Member' }).click();

    // Wait for modal to close
    await this.page.getByRole('dialog', { name: 'Archive Member' }).waitFor({ state: 'hidden' });

    // Wait for navigation to members page
    await this.page.waitForURL('**/members');
  }

  getMemberIdFromUrl() {
    const url = this.page.url();
    return url.split('/').pop()!;
  }

  async gotoById(memberId: string) {
    await super.goto(`http://localhost:3000/members/${memberId}`);
  }
}
