import { test } from '@playwright/test';
import { LoginPage } from './page-objects/LoginPage';
import { CheckinPage } from './page-objects/CheckinPage';
import { MembersPage } from './page-objects/MembersPage';

test.describe('Child Check-In', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login('volunteer@example.com');
  });

  test.fixme('volunteer can check in a child', async ({ page }) => {
    const membersPage = new MembersPage(page);
    await membersPage.goto();
    const memberId = await membersPage.getMemberId('Lydia', 'Ngata');

    const checkinPage = new CheckinPage(page, memberId!);
    await checkinPage.goto();
    await checkinPage.openManageChildrenModal();
    await checkinPage.addChild('Test Child', '2020-01-01');
    await checkinPage.checkinChild('Test Child');
    await checkinPage.verifyChildIsCheckedIn('Test Child');
  });
});
