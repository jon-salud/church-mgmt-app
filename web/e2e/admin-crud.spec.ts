import { test, expect } from "@playwright/test";

const baseUrl = "http://localhost:3000";

test.fixme("admin can manage members, groups, and events end-to-end", async ({ page }) => {
    const timestamp = Date.now();
    const memberFirst = `QA${timestamp}`;
    const memberLast = "Member";
    const memberEmail = `qa-${timestamp}@example.com`;
    const memberPhone = `555-${String(timestamp).slice(-4)}`;

    await page.goto(`${baseUrl}/members`);

    const quickAddSection = page.locator("section").filter({ has: page.getByRole("heading", { name: "Quick Add Member" }) });

    await quickAddSection.getByLabel("First Name").fill(memberFirst);
    await quickAddSection.getByLabel("Last Name").fill(memberLast);
    await quickAddSection.getByLabel("Email").fill(memberEmail);
    await quickAddSection.getByLabel("Phone").fill(memberPhone);
    await quickAddSection.getByRole("button", { name: "Add Member" }).click();

    await page.waitForURL(/\/members\/.+/);
    const memberDetailUrl = page.url();
    const memberId = memberDetailUrl.split("/").pop()!;
    await expect(page.getByRole("heading", { name: `${memberFirst} ${memberLast}` })).toBeVisible();

    await page.getByLabel("Phone").fill(memberPhone);
    await page.getByLabel("Address").fill("123 QA Street");
    await page.getByLabel("Status").selectOption("invited");
    await page.getByLabel("Role").selectOption("Leader");
    await page.getByRole("button", { name: "Save Changes" }).click();
    await expect(page.getByText(`Phone: ${memberPhone}`)).toBeVisible();

    const rolesCard = page.locator("table").filter({ has: page.getByRole("heading", { name: "Roles" }) });
    await expect(rolesCard.locator("li").filter({ hasText: new RegExp(`^${memberFirst}\\s+${memberLast}`) })).toBeVisible();

    await page.goto(`${baseUrl}/groups/group-worship`);
    const addMemberForm = page.locator("form").filter({ has: page.getByRole("button", { name: "Add to Group" }) });
    await addMemberForm.locator('select[name="userId"]').selectOption(memberId);
    await addMemberForm.locator('select[name="role"]').selectOption("Volunteer");
    await addMemberForm.locator('select[name="status"]').selectOption("Active");
    await addMemberForm.getByRole("button", { name: "Add to Group" }).click();

    const memberRow = page.getByRole("row", {
        name: new RegExp(`${memberFirst}\\s+${memberLast}`),
    });
    await expect(memberRow).toBeVisible();

    const updateMembershipForm = memberRow.locator("form").first();
    await updateMembershipForm.locator('select[name="role"]').selectOption("Leader");
    await updateMembershipForm.locator('select[name="status"]').selectOption("Inactive");
    await updateMembershipForm.getByRole("button", { name: "Update" }).click();
    await expect(memberRow.locator("td").nth(1)).toHaveText("Leader");
    await expect(memberRow.locator("td").nth(2)).toHaveText("Inactive");

    const removeMembershipForm = memberRow.locator("form").nth(1);
    await removeMembershipForm.getByRole("button", { name: "Remove" }).click();
    await expect(page.getByRole("row", { name: new RegExp(`${memberFirst}\\s+${memberLast}`) })).toHaveCount(0);

    await page.goto(`${baseUrl}/events`);
    const scheduleSection = page.locator("section").filter({ has: page.getByRole("heading", { name: "Schedule New Event" }) });
    const eventTitle = `QA Event ${timestamp}`;
    const startAt = new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16);
    const endAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16);

    await scheduleSection.getByLabel("Title").fill(eventTitle);
    await scheduleSection.getByLabel("Location").fill("Main Hall");
    await scheduleSection.getByLabel("Start").fill(startAt);
    await scheduleSection.getByLabel("End").fill(endAt);
    await scheduleSection.getByLabel("Visibility").selectOption("public");
    await scheduleSection.getByLabel("Group (optional)").selectOption("");
    await scheduleSection.getByLabel("Tags (comma separated)").fill("QA,Automation");
    await scheduleSection.getByRole("button", { name: "Create Event" }).click();

    await expect(page.getByRole("heading", { name: eventTitle })).toBeVisible();

    const updatedTitle = `${eventTitle} (Updated)`;
    const eventCard = page.locator("article").filter({ has: page.getByRole("heading", { name: eventTitle }) });
    await eventCard.getByText("Edit event details").click();
    const updateEventForm = eventCard.locator("form").filter({ has: page.getByRole("button", { name: "Save Changes" }) });
    await updateEventForm.getByLabel("Title").fill(updatedTitle);
    await updateEventForm.getByLabel("Tags").fill("QA");
    await updateEventForm.getByRole("button", { name: "Save Changes" }).click();
    await expect(page.getByRole("heading", { name: updatedTitle })).toBeVisible();

    const updatedEventCard = page.locator("article").filter({ has: page.getByRole("heading", { name: updatedTitle }) });
    await updatedEventCard.getByText("Edit event details").click();
    await updatedEventCard.getByRole("button", { name: "Delete event" }).click();
    await expect(page.getByRole("heading", { name: updatedTitle })).toHaveCount(0);

    await page.goto(memberDetailUrl);
    await page.getByRole("button", { name: "Remove Member" }).click();
    await page.waitForURL(`${baseUrl}/members`);
    await expect(page.getByRole("cell", { name: new RegExp(`${memberFirst}\\s+${memberLast}`) })).toHaveCount(0);
});
