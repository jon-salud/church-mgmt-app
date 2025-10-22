import { Page, expect } from "@playwright/test";
import { BasePage } from "./BasePage";

export class GroupsPage extends BasePage {
    constructor(page: Page) {
        super(page);
    }

    async goto() {
        await super.goto("http://localhost:3000/groups");
    }

    async addMemberToGroup(memberId: string, role: string, status: string) {
        const addMemberForm = this.page.locator("form", { has: this.page.getByRole("button", { name: "Add to Group" }) });
        await addMemberForm.locator('select[name="userId"]').selectOption(memberId);
        await addMemberForm.locator('select[name="role"]').selectOption(role);
        await addMemberForm.locator('select[name="status"]').selectOption(status);
        await addMemberForm.getByRole("button", { name: "Add to Group" }).click();
    }

    async verifyMemberInGroup(firstName: string, lastName: string) {
        const memberRow = this.getMemberRow(firstName, lastName);
        await expect(memberRow).toBeVisible();
    }

    async updateGroupMembership(firstName: string, lastName: string, newRole: string, newStatus: string) {
        const memberRow = this.getMemberRow(firstName, lastName);
        const updateMembershipForm = memberRow.locator("form").first();
        await updateMembershipForm.locator('select[name="role"]').selectOption(newRole);
        await updateMembershipForm.locator('select[name="status"]').selectOption(newStatus);
        await updateMembershipForm.getByRole("button", { name: "Update" }).click();
    }

    async verifyGroupMembershipUpdate(firstName: string, lastName: string, expectedRole: string, expectedStatus: string) {
        const memberRow = this.getMemberRow(firstName, lastName);
        await expect(memberRow.locator("td").nth(1)).toHaveText(expectedRole);
        await expect(memberRow.locator("td").nth(2)).toHaveText(expectedStatus);
    }

    async removeMemberFromGroup(firstName: string, lastName: string) {
        const memberRow = this.getMemberRow(firstName, lastName);
        const removeMembershipForm = memberRow.locator("form").nth(1);
        await removeMembershipForm.getByRole("button", { name: "Remove" }).click();
    }

    async verifyMemberNotInGroup(firstName: string, lastName: string) {
        await expect(this.page.getByRole("row", { name: new RegExp(`${firstName}\\s+${lastName}`) })).toHaveCount(0);
    }

    private getMemberRow(firstName: string, lastName: string) {
        return this.page.getByRole("row", { name: new RegExp(`${firstName}\\s+${lastName}`) });
    }
}
