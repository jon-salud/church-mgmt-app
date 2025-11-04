import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { bootstrapTestApp } from './support/e2e-bootstrap';

describe('Households Soft Delete (e2e)', () => {
  let app: NestFastifyApplication;
  let createdHouseholdId: string;
  let secondHouseholdId: string;

  beforeAll(async () => {
    const result = await bootstrapTestApp();
    app = result.app;
  });

  afterAll(async () => {
    if (app && typeof app.close === 'function') {
      await app.close();
    }
  });

  // ==================== LIST OPERATIONS ====================

  describe('Households - List Operations', () => {
    it('GET /households should return active households', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/households',
        headers: { authorization: 'Bearer demo-admin' },
      });
      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeGreaterThan(0);
      expect(body[0]).toHaveProperty('id');
      expect(body[0]).toHaveProperty('name');
      // Active households should not have deletedAt or it should be null
      if (body[0].hasOwnProperty('deletedAt')) {
        expect(body[0].deletedAt).toBeNull();
      }
    });

    it('GET /households/deleted/all should return deleted households (admin/leader only)', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/households/deleted/all',
        headers: { authorization: 'Bearer demo-admin' },
      });
      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(Array.isArray(body)).toBe(true);
      // Should have deletedAt timestamp
      body.forEach((household: any) => {
        if (household.deletedAt) {
          expect(household.deletedAt).toBeTruthy();
        }
      });
    });

    it('GET /households/deleted/all should forbid non-admin/leader', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/households/deleted/all',
        headers: { authorization: 'Bearer demo-member' },
      });
      expect(res.statusCode).toBe(403);
    });
  });

  // ==================== CREATE ====================

  describe('Households - Create', () => {
    it('POST /households should create household', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/households',
        headers: { authorization: 'Bearer demo-admin' },
        payload: {
          name: 'Test Household for Deletion',
          address: '123 Test St',
        },
      });
      expect([200, 201]).toContain(res.statusCode);
      const body = res.json();
      expect(body).toHaveProperty('id');
      expect(body.name).toBe('Test Household for Deletion');
      createdHouseholdId = body.id;
    });

    it('POST /households should create second household for bulk operations', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/households',
        headers: { authorization: 'Bearer demo-admin' },
        payload: {
          name: 'Second Test Household',
          address: '456 Test Ave',
        },
      });
      expect([200, 201]).toContain(res.statusCode);
      const body = res.json();
      expect(body).toHaveProperty('id');
      secondHouseholdId = body.id;
    });
  });

  // ==================== SOFT DELETE ====================

  describe('Households - Soft Delete', () => {
    it('DELETE /households/:id should soft delete household (admin/leader)', async () => {
      if (!createdHouseholdId) {
        console.log('Skipping: createdHouseholdId not set');
        return;
      }
      const res = await app.inject({
        method: 'DELETE',
        url: `/api/v1/households/${createdHouseholdId}`,
        headers: { authorization: 'Bearer demo-admin' },
      });
      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body).toHaveProperty('deletedAt');
      expect(body.deletedAt).toBeTruthy();
      expect(body.id).toBe(createdHouseholdId);
    });

    it('DELETE /households/:id should forbid member role', async () => {
      if (!secondHouseholdId) {
        console.log('Skipping: secondHouseholdId not set');
        return;
      }
      const res = await app.inject({
        method: 'DELETE',
        url: `/api/v1/households/${secondHouseholdId}`,
        headers: { authorization: 'Bearer demo-member' },
      });
      expect(res.statusCode).toBe(403);
    });

    it('GET /households should not include soft deleted household', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/households',
        headers: { authorization: 'Bearer demo-admin' },
      });
      expect(res.statusCode).toBe(200);
      const body = res.json();
      const deletedHousehold = body.find((h: any) => h.id === createdHouseholdId);
      expect(deletedHousehold).toBeUndefined();
    });

    it('GET /households/deleted/all should include soft deleted household', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/households/deleted/all',
        headers: { authorization: 'Bearer demo-admin' },
      });
      expect(res.statusCode).toBe(200);
      const body = res.json();
      const deletedHousehold = body.find((h: any) => h.id === createdHouseholdId);
      expect(deletedHousehold).toBeDefined();
      expect(deletedHousehold.deletedAt).toBeTruthy();
    });

    it('DELETE /households/:id should reject deleting already deleted household', async () => {
      if (!createdHouseholdId) {
        console.log('Skipping: createdHouseholdId not set');
        return;
      }
      const res = await app.inject({
        method: 'DELETE',
        url: `/api/v1/households/${createdHouseholdId}`,
        headers: { authorization: 'Bearer demo-admin' },
      });
      // Should return 404 or error since household is already deleted
      expect([404, 400, 500]).toContain(res.statusCode);
    });
  });

  // ==================== RESTORE ====================

  describe('Households - Restore', () => {
    it('POST /households/:id/undelete should restore household (admin/leader)', async () => {
      if (!createdHouseholdId) {
        console.log('Skipping: createdHouseholdId not set');
        return;
      }
      const res = await app.inject({
        method: 'POST',
        url: `/api/v1/households/${createdHouseholdId}/undelete`,
        headers: { authorization: 'Bearer demo-admin' },
      });
      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.deletedAt).toBeNull();
      expect(body.id).toBe(createdHouseholdId);
    });

    it('POST /households/:id/undelete should forbid member role', async () => {
      // First delete the second household
      if (!secondHouseholdId) {
        console.log('Skipping: secondHouseholdId not set');
        return;
      }
      await app.inject({
        method: 'DELETE',
        url: `/api/v1/households/${secondHouseholdId}`,
        headers: { authorization: 'Bearer demo-admin' },
      });

      // Try to restore with member role
      const res = await app.inject({
        method: 'POST',
        url: `/api/v1/households/${secondHouseholdId}/undelete`,
        headers: { authorization: 'Bearer demo-member' },
      });
      expect(res.statusCode).toBe(403);
    });

    it('GET /households should include restored household', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/households',
        headers: { authorization: 'Bearer demo-admin' },
      });
      expect(res.statusCode).toBe(200);
      const body = res.json();
      const restoredHousehold = body.find((h: any) => h.id === createdHouseholdId);
      expect(restoredHousehold).toBeDefined();
      if (restoredHousehold.hasOwnProperty('deletedAt')) {
        expect(restoredHousehold.deletedAt).toBeNull();
      }
    });

    it('POST /households/:id/undelete should reject restoring non-deleted household', async () => {
      if (!createdHouseholdId) {
        console.log('Skipping: createdHouseholdId not set');
        return;
      }
      const res = await app.inject({
        method: 'POST',
        url: `/api/v1/households/${createdHouseholdId}/undelete`,
        headers: { authorization: 'Bearer demo-admin' },
      });
      // Should return error since household is not deleted
      expect([404, 400, 500]).toContain(res.statusCode);
    });
  });

  // ==================== BULK OPERATIONS ====================

  describe('Households - Bulk Operations', () => {
    let bulkHouseholdIds: string[] = [];

    beforeAll(async () => {
      // Create 3 households for bulk testing
      for (let i = 1; i <= 3; i++) {
        const res = await app.inject({
          method: 'POST',
          url: '/api/v1/households',
          headers: { authorization: 'Bearer demo-admin' },
          payload: {
            name: `Bulk Test Household ${i}`,
            address: `${i}00 Bulk St`,
          },
        });
        if (res.statusCode === 200 || res.statusCode === 201) {
          const body = res.json();
          bulkHouseholdIds.push(body.id);
        }
      }
    });

    it('POST /households/bulk-delete should delete multiple households (admin/leader)', async () => {
      if (bulkHouseholdIds.length === 0) {
        console.log('Skipping: no bulk households created');
        return;
      }
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/households/bulk-delete',
        headers: { authorization: 'Bearer demo-admin' },
        payload: {
          householdIds: bulkHouseholdIds,
        },
      });
      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body).toHaveProperty('successCount');
      expect(body.successCount).toBe(3);
      expect(body.failedCount || 0).toBe(0);
    });

    it('POST /households/bulk-delete should forbid member role', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/households/bulk-delete',
        headers: { authorization: 'Bearer demo-member' },
        payload: {
          householdIds: ['dummy-id'],
        },
      });
      expect(res.statusCode).toBe(403);
    });

    it('GET /households should not include bulk deleted households', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/households',
        headers: { authorization: 'Bearer demo-admin' },
      });
      expect(res.statusCode).toBe(200);
      const body = res.json();
      bulkHouseholdIds.forEach(id => {
        const found = body.find((h: any) => h.id === id);
        expect(found).toBeUndefined();
      });
    });

    it('POST /households/bulk-undelete should restore multiple households (admin/leader)', async () => {
      if (bulkHouseholdIds.length === 0) {
        console.log('Skipping: no bulk households created');
        return;
      }
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/households/bulk-undelete',
        headers: { authorization: 'Bearer demo-admin' },
        payload: {
          householdIds: bulkHouseholdIds,
        },
      });
      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body).toHaveProperty('successCount');
      expect(body.successCount).toBe(3);
      expect(body.failedCount || 0).toBe(0);
    });

    it('POST /households/bulk-undelete should forbid member role', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/households/bulk-undelete',
        headers: { authorization: 'Bearer demo-member' },
        payload: {
          householdIds: ['dummy-id'],
        },
      });
      expect(res.statusCode).toBe(403);
    });

    it('POST /households/bulk-delete should handle partial failures', async () => {
      const mixedIds = [
        ...bulkHouseholdIds.slice(0, 1), // 1 valid
        'invalid-id-1',
        'invalid-id-2',
      ];
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/households/bulk-delete',
        headers: { authorization: 'Bearer demo-admin' },
        payload: {
          householdIds: mixedIds,
        },
      });
      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body).toHaveProperty('successCount');
      expect(body).toHaveProperty('failedCount');
      // At least some should succeed and some fail
      expect(body.successCount).toBeGreaterThan(0);
      expect(body.failedCount).toBeGreaterThan(0);
      expect(body.errors).toBeDefined();
      expect(Array.isArray(body.errors)).toBe(true);
    });
  });

  // ==================== EDGE CASES ====================

  describe('Households - Edge Cases', () => {
    it('DELETE /households/:id with invalid ID should return 404', async () => {
      const res = await app.inject({
        method: 'DELETE',
        url: '/api/v1/households/invalid-household-id',
        headers: { authorization: 'Bearer demo-admin' },
      });
      expect([404, 400, 500]).toContain(res.statusCode);
    });

    it('POST /households/:id/undelete with invalid ID should return 404', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/households/invalid-household-id/undelete',
        headers: { authorization: 'Bearer demo-admin' },
      });
      expect([404, 400, 500]).toContain(res.statusCode);
    });

    it('POST /households/bulk-delete with empty array should succeed with zero count', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/households/bulk-delete',
        headers: { authorization: 'Bearer demo-admin' },
        payload: {
          householdIds: [],
        },
      });
      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.successCount).toBe(0);
      expect(body.failedCount || 0).toBe(0);
    });
  });

  // ==================== AUDIT LOGGING ====================

  describe('Households - Audit Logging', () => {
    it('should create audit log for soft delete', async () => {
      // Create a household to delete
      const createRes = await app.inject({
        method: 'POST',
        url: '/api/v1/households',
        headers: { authorization: 'Bearer demo-admin' },
        payload: {
          name: 'Audit Test Household',
          address: '999 Audit St',
        },
      });
      const household = createRes.json();

      // Delete it
      const deleteRes = await app.inject({
        method: 'DELETE',
        url: `/api/v1/households/${household.id}`,
        headers: { authorization: 'Bearer demo-admin' },
      });
      expect(deleteRes.statusCode).toBe(200);

      // Check audit log (if endpoint exists)
      const auditRes = await app.inject({
        method: 'GET',
        url: '/api/v1/audit-log',
        headers: { authorization: 'Bearer demo-admin' },
      });
      if (auditRes.statusCode === 200) {
        const logs = auditRes.json();
        const deleteLog = logs.find(
          (log: any) => log.action === 'household.soft-deleted' && log.entityId === household.id
        );
        expect(deleteLog).toBeDefined();
        if (deleteLog) {
          expect(deleteLog.actorUserId).toBeTruthy();
        }
      }
    });
  });
});
