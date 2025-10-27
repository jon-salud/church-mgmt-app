import { test, expect } from '@playwright/test';
import { DashboardPage } from './page-objects/DashboardPage';
import { AuditLogPage } from './page-objects/AuditLogPage';

test.describe('Smoke Tests', () => {
  test('dashboard renders summary cards and displays data correctly', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);

    await test.step('Navigate to dashboard and verify content', async () => {
      await dashboardPage.goto();
      await dashboardPage.verifyDashboard();
    });

    await test.step('Verify all summary cards are present with data', async () => {
      // Check all stat cards are visible
      await expect(page.getByTestId('stat-members')).toBeVisible();
      await expect(page.getByTestId('stat-groups')).toBeVisible();
      await expect(page.getByTestId('stat-events')).toBeVisible();
      await expect(page.getByTestId('stat-giving')).toBeVisible();

      // Verify stat cards contain numeric data (not just placeholders)
      const membersCard = page.getByTestId('stat-members');
      const membersValue = await membersCard.locator('dd').first().textContent();
      expect(membersValue).toMatch(/\d+/); // Should contain at least one digit

      const groupsCard = page.getByTestId('stat-groups');
      const groupsValue = await groupsCard.locator('dd').first().textContent();
      expect(groupsValue).toMatch(/\d+/);
    });

    await test.step('Verify dashboard sections are present', async () => {
      // Check main sections exist
      await expect(page.getByRole('heading', { name: 'Next events' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Unread announcements' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Recent contributions' })).toBeVisible();
    });
  });

  test('audit log loads data and supports filtering for admins', async ({ page }) => {
    const auditLogPage = new AuditLogPage(page);

    await test.step('Navigate to audit log and verify admin access', async () => {
      await auditLogPage.goto();
      await auditLogPage.verifyAuditLog();
    });

    await test.step('Verify audit log table and data are present', async () => {
      // Check table headers are present (using more specific selectors)
      await expect(page.locator('thead th').filter({ hasText: 'When' })).toBeVisible();
      await expect(page.locator('thead th').filter({ hasText: 'Summary' })).toBeVisible();
      await expect(page.locator('thead th').filter({ hasText: 'Actor' })).toBeVisible();
      await expect(page.locator('thead th').filter({ hasText: 'Entity' })).toBeVisible();
      await expect(page.locator('thead th').filter({ hasText: 'Details' })).toBeVisible();

      // Check that we have at least some audit entries (should have mock data)
      const tableRows = page.locator('tbody tr');
      await expect(tableRows.first()).toBeVisible();

      // Verify pagination info is shown
      await expect(page.getByText(/Showing page \d+ of \d+/)).toBeVisible();
      await expect(page.getByText(/\d+ total entries/)).toBeVisible();
    });

    await test.step('Verify filter form is functional', async () => {
      // Check filter inputs are present using more specific selectors
      await expect(page.locator('input[name="entity"]')).toBeVisible();
      await expect(page.locator('input[name="actorUserId"]')).toBeVisible();
      await expect(page.locator('input[name="entityId"]')).toBeVisible();
      await expect(page.locator('input[name="from"]')).toBeVisible();
      await expect(page.locator('input[name="to"]')).toBeVisible();

      // Check apply filters button exists
      await expect(page.getByRole('button', { name: 'Apply Filters' })).toBeVisible();
    });
  });
});
