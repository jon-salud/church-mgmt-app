import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class MembersPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await super.goto('http://localhost:3000/members');
  }

  async quickAddMember(firstName: string, lastName: string, email: string, phone: string) {
    const quickAddSection = this.page.locator('section', { has: this.page.getByRole('heading', { name: 'Quick Add Member' }) });
    await quickAddSection.getByLabel('First Name').fill(firstName);
    await quickAddSection.getByLabel('Last Name').fill(lastName);
    await quickAddSection.getByLabel('Email').fill(email);
    await quickAddSection.getByLabel('Phone').fill(phone);
    await quickAddSection.getByRole('button', { name: 'Add Member' }).click();
    await this.page.waitForURL(/\/members\/.+/);
  }

  async verifyMemberNotInList(firstName: string, lastName: string) {
    await expect(this.page.getByRole('cell', { name: new RegExp(`${firstName}\\s+${lastName}`) })).toHaveCount(0);
  }
}
