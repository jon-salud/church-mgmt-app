import { test } from '@playwright/test';
import { MembersPage } from './page-objects/MembersPage';
import { MemberDetailPage } from './page-objects/MemberDetailPage';
import { GroupsPage } from './page-objects/GroupsPage';
import { EventsPage } from './page-objects/EventsPage';

test.describe('Admin CRUD Operations', () => {
  test('admin can manage members, groups, and events end-to-end', async ({ page }) => {
    const timestamp = Date.now();
    const memberFirst = `QA${timestamp}`;
    const memberLast = 'Member';
    const memberEmail = `qa-${timestamp}@example.com`;
    const memberPhone = `555-${String(timestamp).slice(-4)}`;
    const updatedMemberPhone = `555-${String(timestamp).slice(-4)}-U`;
    const groupName = 'group-worship';
    const eventTitle = `QA Event ${timestamp}`;
    const updatedEventTitle = `${eventTitle} (Updated)`;

    const membersPage = new MembersPage(page);
    const memberDetailPage = new MemberDetailPage(page);
    const groupsPage = new GroupsPage(page);
    const eventsPage = new EventsPage(page);

    // Member creation
    await membersPage.goto();
    await membersPage.checkAccessibility();
    await membersPage.quickAddMember(memberFirst, memberLast, memberEmail, memberPhone);
    const memberId = memberDetailPage.getMemberIdFromUrl();

    // Member detail and update
    await memberDetailPage.verifyMemberName(memberFirst, memberLast);
    await memberDetailPage.checkAccessibility();
    await memberDetailPage.updateMemberDetails(updatedMemberPhone, '123 QA Street');
    await memberDetailPage.verifyMemberRole('Leader');

    // Group management
    await groupsPage.goto(groupName);
    await groupsPage.checkAccessibility();
    await groupsPage.addMemberToGroup(memberId, 'Volunteer', 'Active');
    await groupsPage.verifyMemberInGroup(memberFirst, memberLast);
    await groupsPage.updateGroupMembership(memberFirst, memberLast, 'Leader', 'Inactive');
    await groupsPage.verifyGroupMembershipUpdate(memberFirst, memberLast, 'Leader', 'Inactive');
    await groupsPage.removeMemberFromGroup(memberFirst, memberLast);
    await groupsPage.verifyMemberNotInGroup(memberFirst, memberLast);

    // Event management
    await eventsPage.goto();
    await eventsPage.checkAccessibility();
    const startAt = new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16);
    const endAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16);
    await eventsPage.scheduleNewEvent(eventTitle, 'Main Hall', startAt, endAt, 'QA,Automation');
    await eventsPage.verifyEventVisible(eventTitle);
    await eventsPage.updateEvent(eventTitle, updatedEventTitle, 'QA');
    await eventsPage.verifyEventVisible(updatedEventTitle);
    await eventsPage.deleteEvent(updatedEventTitle);
    await eventsPage.verifyEventNotVisible(updatedEventTitle);

    await test.step('Delete the member', async () => {
      await memberDetailPage.gotoById(memberId);
      await memberDetailPage.removeMember();
      await membersPage.goto();
      await membersPage.verifyMemberNotInList(memberFirst, memberLast);
    });
  });
});
