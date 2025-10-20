import { test } from '@playwright/test';
import { DashboardPage } from './page-objects/DashboardPage';
import { AuditLogPage } from './page-objects/AuditLogPage';

test.describe('Smoke Tests', () => {
  test('dashboard renders summary cards and passes accessibility check', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);

    await test.step('Navigate to dashboard and verify content', async () => {
      await dashboardPage.goto();
      await dashboardPage.verifyDashboard();
    });

    await test.step('Check for accessibility violations', async () => {
      await dashboardPage.checkAccessibility();
    });
  });

  test('audit log is visible to admins and passes accessibility check', async ({ page }) => {
    const auditLogPage = new AuditLogPage(page);

    await test.step('Navigate to audit log and verify content', async () => {
      await auditLogPage.goto();
      await auditLogPage.verifyAuditLog();
    });

    await test.step('Check for accessibility violations', async () => {
      await auditLogPage.checkAccessibility();
    });
  });
});
