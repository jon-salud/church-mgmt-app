import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class MembersPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await super.goto('http://localhost:3000/members');
  }

  async quickAddMember(
    firstName: string,
    lastName: string,
    email: string,
    phone: string
  ): Promise<string> {
    // Since server actions don't work in Playwright E2E tests, we'll use the API directly
    // First navigate to members page to ensure we're on the right page
    await this.page.goto('http://localhost:3000/members');

    // Create member via API
    const response = await this.page.request.post('http://localhost:3001/api/v1/users', {
      data: {
        primaryEmail: email,
        firstName,
        lastName,
        phone,
        roleIds: ['role-member'], // Default role
        profile: {
          phone,
          householdRole: 'Head',
        },
      },
      headers: {
        'Content-Type': 'application/json',
        Cookie: 'demo_token=demo-admin; session_provider=demo',
      },
    });

    if (!response.ok()) {
      throw new Error(`Failed to create member: ${response.status()} ${response.statusText()}`);
    }

    const member = await response.json();
    return member.id;
  }

  async verifyMemberNotInList(firstName: string, lastName: string) {
    await expect(
      this.page.getByRole('cell', { name: new RegExp(`${firstName}\\s+${lastName}`) })
    ).toHaveCount(0);
  }

  async toggleShowArchived() {
    await this.page.getByLabel('Show archived members').check();
  }

  async verifyMemberInArchivedList(firstName: string, lastName: string) {
    await this.page.getByLabel('Show archived members').check();
    await expect(
      this.page.getByRole('cell', { name: new RegExp(`${firstName}\\s+${lastName}`) })
    ).toBeVisible();
  }

  async getMemberId(firstName: string, lastName: string): Promise<string | null> {
    const memberLink = this.page.locator(`a:has-text("${firstName} ${lastName}")`);
    if (await memberLink.count()) {
      const href = await memberLink.getAttribute('href');
      return href ? href.split('/').pop()! : null;
    }
    return null;
  }
}
