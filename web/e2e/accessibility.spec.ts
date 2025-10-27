import { test, Page, BrowserContext } from '@playwright/test';
import { DashboardPage } from './page-objects/DashboardPage';
import { MembersPage } from './page-objects/MembersPage';
import { HouseholdsPage } from './page-objects/HouseholdsPage';
import { GroupsPage } from './page-objects/GroupsPage';
import { EventsPage } from './page-objects/EventsPage';
import { AnnouncementsPage } from './page-objects/AnnouncementsPage';
import { PrayerPage } from './page-objects/PrayerPage';
import { RequestsPage } from './page-objects/RequestsPage';
import { GivingPage } from './page-objects/GivingPage';
import { RolesPage } from './page-objects/RolesPage';
import { AuditLogPage } from './page-objects/AuditLogPage';
import { PastoralCarePage } from './page-objects/PastoralCarePage';
import { SettingsPage } from './page-objects/SettingsPage';

// Helper functions for theme management
async function setLightTheme(page: Page) {
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('theme', 'light'));
  await page.reload();
  await page.waitForLoadState('load');
}

async function setDarkTheme(page: Page) {
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('theme', 'dark'));
  await page.reload();
  await page.waitForLoadState('load');
}

test.describe.serial('Accessibility tests - Light Theme', () => {
  let context: BrowserContext;
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext();
    page = await context.newPage();
    await setLightTheme(page);
  });

  test.afterAll(async () => {
    await context.close();
  });

  test('dashboard is accessible', async () => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.goto();
    await page.waitForLoadState('load');
    await dashboardPage.checkAccessibility();
  });

  test('members page is accessible', async () => {
    const membersPage = new MembersPage(page);
    await membersPage.goto();
    await page.waitForLoadState('load');
    await membersPage.checkAccessibility();
  });

  test('households page is accessible', async () => {
    const householdsPage = new HouseholdsPage(page);
    await householdsPage.goto();
    await page.waitForLoadState('load');
    await householdsPage.checkAccessibility();
  });

  test('groups page is accessible', async () => {
    const groupsPage = new GroupsPage(page);
    await groupsPage.goto();
    await page.waitForLoadState('load');
    await groupsPage.checkAccessibility();
  });

  test('events page is accessible', async () => {
    const eventsPage = new EventsPage(page);
    await eventsPage.goto();
    await page.waitForLoadState('load');
    await eventsPage.checkAccessibility();
  });

  test('announcements page is accessible', async () => {
    const announcementsPage = new AnnouncementsPage(page);
    await announcementsPage.goto();
    await page.waitForLoadState('load');
    await announcementsPage.checkAccessibility();
  });

  test('prayer page is accessible', async () => {
    const prayerPage = new PrayerPage(page);
    await prayerPage.goto();
    await page.waitForLoadState('load');
    await prayerPage.checkAccessibility();
  });

  test('requests page is accessible', async () => {
    const requestsPage = new RequestsPage(page);
    await requestsPage.goto();
    await page.waitForLoadState('load');
    await requestsPage.checkAccessibility();
  });

  test('giving page is accessible', async () => {
    const givingPage = new GivingPage(page);
    await givingPage.goto();
    await page.waitForLoadState('load');
    await givingPage.checkAccessibility();
  });

  test('roles page is accessible', async () => {
    const rolesPage = new RolesPage(page);
    await rolesPage.goto();
    await page.waitForLoadState('load');
    await rolesPage.checkAccessibility();
  });

  test('audit log page is accessible', async () => {
    const auditLogPage = new AuditLogPage(page);
    await auditLogPage.goto();
    await page.waitForLoadState('load');
    await auditLogPage.checkAccessibility();
  });

  test('pastoral care page is accessible', async () => {
    const pastoralCarePage = new PastoralCarePage(page);
    await pastoralCarePage.goto();
    await page.waitForLoadState('load');
    await pastoralCarePage.checkAccessibility();
  });

  test('settings page is accessible', async () => {
    const settingsPage = new SettingsPage(page);
    await settingsPage.goto();
    await page.waitForLoadState('load');
    await settingsPage.checkAccessibility();
  });
});

test.describe.serial('Accessibility tests - Dark Theme', () => {
  let context: BrowserContext;
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext();
    page = await context.newPage();
    await setDarkTheme(page);
  });

  test.afterAll(async () => {
    await context.close();
  });

  test('dashboard is accessible', async () => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.goto();
    await page.waitForLoadState('load');
    await dashboardPage.checkAccessibility();
  });

  test('members page is accessible', async () => {
    const membersPage = new MembersPage(page);
    await membersPage.goto();
    await page.waitForLoadState('load');
    await membersPage.checkAccessibility();
  });

  test('households page is accessible', async () => {
    const householdsPage = new HouseholdsPage(page);
    await householdsPage.goto();
    await page.waitForLoadState('load');
    await householdsPage.checkAccessibility();
  });

  test('groups page is accessible', async () => {
    const groupsPage = new GroupsPage(page);
    await groupsPage.goto();
    await page.waitForLoadState('load');
    await groupsPage.checkAccessibility();
  });

  test('events page is accessible', async () => {
    const eventsPage = new EventsPage(page);
    await eventsPage.goto();
    await page.waitForLoadState('load');
    await eventsPage.checkAccessibility();
  });

  test('announcements page is accessible', async () => {
    const announcementsPage = new AnnouncementsPage(page);
    await announcementsPage.goto();
    await page.waitForLoadState('load');
    await announcementsPage.checkAccessibility();
  });

  test('prayer page is accessible', async () => {
    const prayerPage = new PrayerPage(page);
    await prayerPage.goto();
    await page.waitForLoadState('load');
    await prayerPage.checkAccessibility();
  });

  test('requests page is accessible', async () => {
    const requestsPage = new RequestsPage(page);
    await requestsPage.goto();
    await page.waitForLoadState('load');
    await requestsPage.checkAccessibility();
  });

  test('giving page is accessible', async () => {
    const givingPage = new GivingPage(page);
    await givingPage.goto();
    await page.waitForLoadState('load');
    await givingPage.checkAccessibility();
  });

  test('roles page is accessible', async () => {
    const rolesPage = new RolesPage(page);
    await rolesPage.goto();
    await page.waitForLoadState('load');
    await rolesPage.checkAccessibility();
  });

  test('audit log page is accessible', async () => {
    const auditLogPage = new AuditLogPage(page);
    await auditLogPage.goto();
    await page.waitForLoadState('load');
    await auditLogPage.checkAccessibility();
  });

  test('pastoral care page is accessible', async () => {
    const pastoralCarePage = new PastoralCarePage(page);
    await pastoralCarePage.goto();
    await page.waitForLoadState('load');
    await pastoralCarePage.checkAccessibility();
  });

  test('settings page is accessible', async () => {
    const settingsPage = new SettingsPage(page);
    await settingsPage.goto();
    await page.waitForLoadState('load');
    await settingsPage.checkAccessibility();
  });
});
