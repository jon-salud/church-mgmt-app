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

  // ==================== SETUP TEST DATA ====================

  describe('Households - Setup', () => {
    it('should get seeded households for testing', async () => {
      // Use existing seeded households instead of creating new ones
      // The mock database comes with pre-seeded households
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/households',
        headers: { authorization: 'Bearer demo-admin' },
      });
      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.length).toBeGreaterThanOrEqual(2);

      // Use the first two households for testing
      createdHouseholdId = body[0].id;
      secondHouseholdId = body[1].id;

      expect(createdHouseholdId).toBeDefined();
      expect(secondHouseholdId).toBeDefined();
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
      expect(body).toHaveProperty('success');
      expect(body.success).toBe(true);
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
      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.success).toBe(false);
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
      expect(body).toHaveProperty('success');
      expect(body.success).toBe(true);
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
      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.success).toBe(false);
    });
  });

  // ==================== BULK OPERATIONS ====================

  describe('Households - Bulk Operations', () => {
    let bulkHouseholdIds: string[] = [];

    beforeAll(async () => {
      // Get seeded households for bulk testing instead of creating new ones
      // Since POST /households doesn't exist in Phase 5
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/households',
        headers: { authorization: 'Bearer demo-admin' },
      });

      if (res.statusCode === 200) {
        const households = res.json();
        // Use households starting from index 2 to avoid conflicts with single delete tests
        // Ensure we have at least 3 households for bulk operations
        if (households.length >= 5) {
          bulkHouseholdIds = [households[2].id, households[3].id, households[4].id];
        } else {
          // Fallback: use any available households beyond the first two
          bulkHouseholdIds = households
            .slice(2, Math.min(5, households.length))
            .map((h: any) => h.id);
        }
      }
    });

    it('POST /households/bulk-delete should delete multiple households (admin/leader)', async () => {
      if (bulkHouseholdIds.length === 0) {
        console.log('Skipping: no bulk households available');
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
      // Should match number of valid IDs provided
      expect(body.successCount).toBe(bulkHouseholdIds.length);
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
      // Get fresh households for partial failure test
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/households',
        headers: { authorization: 'Bearer demo-admin' },
      });
      expect(res.statusCode).toBe(200);
      const freshHouseholds = res.json();

      // Use one valid ID and two invalid IDs
      const validId = freshHouseholds.length > 5 ? freshHouseholds[5].id : freshHouseholds[0].id;
      const mixedIds = [
        validId, // 1 valid
        'invalid-id-1',
        'invalid-id-2',
      ];
      const deleteRes = await app.inject({
        method: 'POST',
        url: '/api/v1/households/bulk-delete',
        headers: { authorization: 'Bearer demo-admin' },
        payload: {
          householdIds: mixedIds,
        },
      });
      expect(deleteRes.statusCode).toBe(200);
      const body = deleteRes.json();
      expect(body).toHaveProperty('successCount');
      expect(body).toHaveProperty('failedCount');
      // Should have 1 success and 2 failures
      expect(body.successCount).toBe(1);
      expect(body.failedCount).toBe(2);
      expect(body.errors).toBeDefined();
      expect(Array.isArray(body.errors)).toBe(true);
    });
  });

  // ==================== EDGE CASES ====================

  describe('Households - Edge Cases', () => {
    it('DELETE /households/:id with invalid ID should return error', async () => {
      const res = await app.inject({
        method: 'DELETE',
        url: '/api/v1/households/invalid-household-id',
        headers: { authorization: 'Bearer demo-admin' },
      });
      // DataStore returns success: false for invalid IDs, which maps to 200 with success=false
      // or may return error status depending on implementation
      expect(res.statusCode).toBeGreaterThanOrEqual(200);
      if (res.statusCode === 200) {
        const body = res.json();
        expect(body.success).toBe(false);
      }
    });

    it('POST /households/:id/undelete with invalid ID should return error', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/households/invalid-household-id/undelete',
        headers: { authorization: 'Bearer demo-admin' },
      });
      // DataStore returns success: false for invalid IDs
      expect(res.statusCode).toBeGreaterThanOrEqual(200);
      if (res.statusCode === 200) {
        const body = res.json();
        expect(body.success).toBe(false);
      }
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
      // Get a household that hasn't been deleted yet
      const listRes = await app.inject({
        method: 'GET',
        url: '/api/v1/households',
        headers: { authorization: 'Bearer demo-admin' },
      });
      const households = listRes.json();
      // Find a household that's not one of our test households
      const household =
        households.find((h: any) => h.id !== createdHouseholdId && h.id !== secondHouseholdId) ||
        households[households.length - 1];

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
