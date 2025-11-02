import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class GroupsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await super.goto('http://localhost:3000/groups');
  }

  async gotoGroup(groupId: string) {
    await super.goto(`http://localhost:3000/groups/${groupId}`);
  }

  async addMemberToGroup(memberId: string, role: string, status: string) {
    const addMemberForm = this.page.locator('form', {
      has: this.page.getByRole('button', { name: 'Add to Group' }),
    });
    await addMemberForm.locator('select[name="userId"]').selectOption(memberId);
    await addMemberForm.locator('select[name="role"]').selectOption(role);
    await addMemberForm.locator('select[name="status"]').selectOption(status);
    await addMemberForm.getByRole('button', { name: 'Add to Group' }).click();
  }

  async verifyMemberInGroup(firstName: string, lastName: string) {
    const memberRow = this.getMemberRow(firstName, lastName);
    await expect(memberRow).toBeVisible();
  }

  async updateGroupMembership(
    firstName: string,
    lastName: string,
    newRole: string,
    newStatus: string
  ) {
    const memberRow = this.getMemberRow(firstName, lastName);
    const updateMembershipForm = memberRow.locator('form').first();
    await updateMembershipForm.locator('select[name="role"]').selectOption(newRole);
    await updateMembershipForm.locator('select[name="status"]').selectOption(newStatus);
    await updateMembershipForm.getByRole('button', { name: 'Update' }).click();
  }

  async verifyGroupMembershipUpdate(
    firstName: string,
    lastName: string,
    expectedRole: string,
    expectedStatus: string
  ) {
    const memberRow = this.getMemberRow(firstName, lastName);
    await expect(memberRow.locator('td').nth(1)).toHaveText(expectedRole);
    await expect(memberRow.locator('td').nth(2)).toHaveText(expectedStatus);
  }

  async removeMemberFromGroup(firstName: string, lastName: string) {
    const memberRow = this.getMemberRow(firstName, lastName);
    const removeMembershipForm = memberRow.locator('form').nth(1);
    await removeMembershipForm.getByRole('button', { name: 'Remove' }).click();
  }

  async verifyMemberNotInGroup(firstName: string, lastName: string) {
    await expect(
      this.page.getByRole('row', { name: new RegExp(`${firstName}\\s+${lastName}`) })
    ).toHaveCount(0);
  }

  private getMemberRow(firstName: string, lastName: string) {
    return this.page.getByRole('row', { name: new RegExp(`${firstName}\\s+${lastName}`) });
  }

  // Soft delete methods
  async toggleShowArchived() {
    await this.page.locator('#show-archived-groups').click();
  }

  async verifyArchivedToggleVisible() {
    await expect(this.page.locator('label:has(#show-archived-groups)')).toBeVisible();
  }

  async archiveGroup(groupName: string) {
    const groupCard = this.page.locator('article').filter({ hasText: groupName });
    await groupCard.locator('button[id^="archive-group-"]').click();
  }

  async restoreGroup(groupName: string) {
    const groupCard = this.page.locator('article').filter({ hasText: groupName });
    await groupCard.locator('button[id^="restore-group-"]').click();
  }

  async verifyGroupArchived(groupName: string) {
    const groupCard = this.page.locator('article').filter({ hasText: groupName });
    await expect(groupCard.getByText('Archived')).toBeVisible();
  }

  async verifyGroupNotArchived(groupName: string) {
    const groupCard = this.page.locator('article').filter({ hasText: groupName });
    await expect(groupCard.getByText('Archived')).not.toBeVisible();
  }

  async verifyGroupVisible(groupName: string) {
    await expect(this.page.locator('article').filter({ hasText: groupName })).toBeVisible();
  }

  async verifyGroupNotVisible(groupName: string) {
    await expect(this.page.locator('article').filter({ hasText: groupName })).not.toBeVisible();
  }

  async selectGroup(groupName: string) {
    const groupCard = this.page.locator('article').filter({ hasText: groupName });
    const checkbox = groupCard.locator('input[type="checkbox"]').first();
    await checkbox.check();
  }

  async verifySelectAllCheckbox() {
    await expect(this.page.locator('#select-all-groups')).toBeVisible();
  }

  async selectAllGroups() {
    await this.page.locator('#select-all-groups').check();
  }

  async bulkArchiveGroups() {
    await this.page.locator('#bulk-archive-groups-button').click();
  }

  async bulkRestoreGroups() {
    await this.page.locator('#bulk-restore-groups-button').click();
  }

  async confirmBulkAction() {
    await this.page.once('dialog', dialog => dialog.accept());
  }

  async verifyBulkArchiveButtonVisible() {
    await expect(this.page.locator('#bulk-archive-groups-button')).toBeVisible();
  }

  async verifyBulkRestoreButtonVisible() {
    await expect(this.page.locator('#bulk-restore-groups-button')).toBeVisible();
  }
}
