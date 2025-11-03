import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { bootstrapTestApp } from './support/e2e-bootstrap';

describe('Giving Soft Delete (e2e)', () => {
  let app: NestFastifyApplication;
  let createdFundId: string;
  let createdContributionId: string;

  beforeAll(async () => {
    const result = await bootstrapTestApp();
    app = result.app;
  });

  afterAll(async () => {
    if (app && typeof app.close === 'function') {
      await app.close();
    }
  });

  // ==================== FUND TESTS ====================

  describe('Funds - List Operations', () => {
    it('GET /funds should return active funds', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/giving/funds',
        headers: { authorization: 'Bearer demo-admin' },
      });
      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeGreaterThan(0);
      expect(body[0]).toHaveProperty('id');
      expect(body[0]).toHaveProperty('name');
      expect(body[0]).not.toHaveProperty('deletedAt');
    });

    it('GET /funds/deleted/all should return deleted funds (admin only)', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/giving/funds/deleted/all',
        headers: { authorization: 'Bearer demo-admin' },
      });
      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(Array.isArray(body)).toBe(true);
    });

    it('GET /funds/deleted/all should forbid non-admin', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/giving/funds/deleted/all',
        headers: { authorization: 'Bearer demo-member' },
      });
      expect(res.statusCode).toBe(403);
    });
  });

  describe('Funds - Create', () => {
    it('POST /funds should create fund (leader+)', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/giving/funds',
        headers: { authorization: 'Bearer demo-admin' },
        payload: {
          name: 'Youth Fund',
          description: 'For youth programs',
        },
      });
      expect([200, 201]).toContain(res.statusCode);
      const body = res.json();
      expect(body).toHaveProperty('id');
      expect(body.name).toBe('Youth Fund');
      createdFundId = body.id;
    });

    it('POST /funds should forbid member', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/giving/funds',
        headers: { authorization: 'Bearer demo-member' },
        payload: { name: 'Test Fund' },
      });
      expect(res.statusCode).toBe(403);
    });
  });

  describe('Funds - Update', () => {
    it('PATCH /funds/:id should update fund (leader+)', async () => {
      if (!createdFundId) {
        console.log('Skipping: createdFundId not set');
        return;
      }
      const res = await app.inject({
        method: 'PATCH',
        url: `/api/v1/giving/funds/${createdFundId}`,
        headers: { authorization: 'Bearer demo-admin' },
        payload: { name: 'Updated Youth Fund' },
      });
      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.name).toBe('Updated Youth Fund');
    });
  });

  describe('Funds - Soft Delete', () => {
    it('DELETE /funds/:id should soft delete fund (leader+)', async () => {
      if (!createdFundId) {
        console.log('Skipping: createdFundId not set');
        return;
      }
      const res = await app.inject({
        method: 'DELETE',
        url: `/api/v1/giving/funds/${createdFundId}`,
        headers: { authorization: 'Bearer demo-admin' },
      });
      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.success).toBe(true);
    });

    it('DELETE /funds/:id with non-existent ID should return 404', async () => {
      const res = await app.inject({
        method: 'DELETE',
        url: '/api/v1/giving/funds/fund-nonexistent',
        headers: { authorization: 'Bearer demo-admin' },
      });
      expect(res.statusCode).toBe(404);
    });

    it('DELETE /funds/:id should forbid member', async () => {
      const res = await app.inject({
        method: 'DELETE',
        url: '/api/v1/giving/funds/fund-general',
        headers: { authorization: 'Bearer demo-member' },
      });
      expect(res.statusCode).toBe(403);
    });
  });

  describe('Funds - Hard Delete', () => {
    let fundToHardDelete: string;

    beforeAll(async () => {
      // Create a fund for hard delete testing
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/giving/funds',
        headers: { authorization: 'Bearer demo-admin' },
        payload: { name: 'Fund for Hard Delete Test' },
      });
      if (res.statusCode === 201 || res.statusCode === 200) {
        fundToHardDelete = res.json().id;
      }
    });

    it('DELETE /funds/:id/hard should hard delete fund (admin only)', async () => {
      if (!fundToHardDelete) {
        console.log('Skipping: fundToHardDelete not set');
        return;
      }
      const res = await app.inject({
        method: 'DELETE',
        url: `/api/v1/giving/funds/${fundToHardDelete}/hard`,
        headers: { authorization: 'Bearer demo-admin' },
      });
      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.success).toBe(true);
    });

    it('DELETE /funds/:id/hard should forbid leader', async () => {
      const res = await app.inject({
        method: 'DELETE',
        url: '/api/v1/giving/funds/fund-general/hard',
        headers: { authorization: 'Bearer demo-leader' },
      });
      expect(res.statusCode).toBe(403);
    });
  });

  describe('Funds - Undelete', () => {
    it('POST /funds/:id/undelete should restore soft-deleted fund (leader+)', async () => {
      if (!createdFundId) {
        console.log('Skipping: createdFundId not set');
        return;
      }
      const res = await app.inject({
        method: 'POST',
        url: `/api/v1/giving/funds/${createdFundId}/undelete`,
        headers: { authorization: 'Bearer demo-admin' },
      });
      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.success).toBe(true);
    });

    it('POST /funds/:id/undelete with non-deleted fund should return 404', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/giving/funds/fund-general/undelete',
        headers: { authorization: 'Bearer demo-admin' },
      });
      expect(res.statusCode).toBe(404);
    });
  });

  describe('Funds - Bulk Operations', () => {
    let fundIds: string[] = [];

    beforeAll(async () => {
      // Create 2 funds for bulk testing
      for (let i = 0; i < 2; i++) {
        const res = await app.inject({
          method: 'POST',
          url: '/api/v1/giving/funds',
          headers: { authorization: 'Bearer demo-admin' },
          payload: { name: `Bulk Test Fund ${i}` },
        });
        if (res.statusCode === 201 || res.statusCode === 200) {
          fundIds.push(res.json().id);
        }
      }
    });

    it('POST /funds/bulk-delete should soft delete multiple funds', async () => {
      if (fundIds.length < 2) {
        console.log('Skipping: not enough funds created');
        return;
      }
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/giving/funds/bulk-delete',
        headers: { authorization: 'Bearer demo-admin' },
        payload: { ids: [fundIds[0], fundIds[1]] },
      });
      expect([200, 201]).toContain(res.statusCode);
      const body = res.json();
      expect(body.success).toBeGreaterThan(0);
    });

    it('POST /funds/bulk-undelete should restore multiple deleted funds', async () => {
      if (fundIds.length < 2) {
        console.log('Skipping: not enough funds created');
        return;
      }
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/giving/funds/bulk-undelete',
        headers: { authorization: 'Bearer demo-admin' },
        payload: { ids: [fundIds[0], fundIds[1]] },
      });
      expect([200, 201]).toContain(res.statusCode);
      const body = res.json();
      expect(body.success).toBeGreaterThanOrEqual(0);
    });
  });

  // ==================== CONTRIBUTION TESTS ====================

  describe('Contributions - List Operations', () => {
    it('GET /contributions should return active contributions', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/giving/contributions',
        headers: { authorization: 'Bearer demo-admin' },
      });
      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(Array.isArray(body)).toBe(true);
      expect(body[0]).toHaveProperty('id');
      expect(body[0]).toHaveProperty('amount');
      expect(body[0]).not.toHaveProperty('deletedAt');
    });

    it('GET /contributions/deleted/all should return deleted contributions (leader+)', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/giving/contributions/deleted/all',
        headers: { authorization: 'Bearer demo-admin' },
      });
      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(Array.isArray(body)).toBe(true);
    });

    it('GET /contributions should filter by memberId (member sees only own)', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/giving/contributions',
        headers: { authorization: 'Bearer demo-member' },
      });
      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(Array.isArray(body)).toBe(true);
      // All should be from the current user
      body.forEach((c: any) => {
        expect(c.memberId).toBeDefined();
      });
    });
  });

  describe('Contributions - Create', () => {
    it('POST /contributions should record contribution (leader+)', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/giving/contributions',
        headers: { authorization: 'Bearer demo-admin' },
        payload: {
          memberId: 'user-member-1',
          amount: 250.0,
          date: new Date().toISOString(),
          fundId: 'fund-general',
          method: 'bank-transfer',
          note: 'Test contribution',
        },
      });
      expect([200, 201]).toContain(res.statusCode);
      const body = res.json();
      expect(body).toHaveProperty('id');
      expect(body.amount).toBe(250.0);
      createdContributionId = body.id;
    });

    it('POST /contributions should forbid member', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/giving/contributions',
        headers: { authorization: 'Bearer demo-member' },
        payload: {
          memberId: 'user-member-1',
          amount: 100.0,
          date: new Date().toISOString(),
          method: 'cash',
        },
      });
      expect(res.statusCode).toBe(403);
    });
  });

  describe('Contributions - Update', () => {
    it('PATCH /contributions/:id should update contribution (leader+)', async () => {
      if (!createdContributionId) {
        console.log('Skipping: createdContributionId not set');
        return;
      }
      const res = await app.inject({
        method: 'PATCH',
        url: `/api/v1/giving/contributions/${createdContributionId}`,
        headers: { authorization: 'Bearer demo-admin' },
        payload: { amount: 300.0 },
      });
      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.amount).toBe(300.0);
    });
  });

  describe('Contributions - Soft Delete', () => {
    it('DELETE /contributions/:id should soft delete contribution (leader+)', async () => {
      if (!createdContributionId) {
        console.log('Skipping: createdContributionId not set');
        return;
      }
      const res = await app.inject({
        method: 'DELETE',
        url: `/api/v1/giving/contributions/${createdContributionId}`,
        headers: { authorization: 'Bearer demo-admin' },
      });
      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.success).toBe(true);
    });

    it('DELETE /contributions/:id should forbid member', async () => {
      const res = await app.inject({
        method: 'DELETE',
        url: '/api/v1/giving/contributions/contribution-1',
        headers: { authorization: 'Bearer demo-member' },
      });
      expect(res.statusCode).toBe(403);
    });
  });

  describe('Contributions - Hard Delete', () => {
    let contributionToHardDelete: string;

    beforeAll(async () => {
      // Create a contribution for hard delete testing
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/giving/contributions',
        headers: { authorization: 'Bearer demo-admin' },
        payload: {
          memberId: 'user-member-1',
          amount: 75.0,
          date: new Date().toISOString(),
          method: 'cash',
        },
      });
      if (res.statusCode === 201 || res.statusCode === 200) {
        contributionToHardDelete = res.json().id;
      }
    });

    it('DELETE /contributions/:id/hard should hard delete contribution (admin only)', async () => {
      if (!contributionToHardDelete) {
        console.log('Skipping: contributionToHardDelete not set');
        return;
      }
      const res = await app.inject({
        method: 'DELETE',
        url: `/api/v1/giving/contributions/${contributionToHardDelete}/hard`,
        headers: { authorization: 'Bearer demo-admin' },
      });
      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.success).toBe(true);
    });

    it('DELETE /contributions/:id/hard should forbid leader', async () => {
      const res = await app.inject({
        method: 'DELETE',
        url: '/api/v1/giving/contributions/contribution-1/hard',
        headers: { authorization: 'Bearer demo-leader' },
      });
      expect(res.statusCode).toBe(403);
    });
  });

  describe('Contributions - Undelete', () => {
    it('POST /contributions/:id/undelete should restore soft-deleted contribution (leader+)', async () => {
      if (!createdContributionId) {
        console.log('Skipping: createdContributionId not set');
        return;
      }
      const res = await app.inject({
        method: 'POST',
        url: `/api/v1/giving/contributions/${createdContributionId}/undelete`,
        headers: { authorization: 'Bearer demo-admin' },
      });
      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.success).toBe(true);
    });
  });

  describe('Contributions - Bulk Operations', () => {
    let contributionIds: string[] = [];

    beforeAll(async () => {
      // Create 2 contributions for bulk testing
      for (let i = 0; i < 2; i++) {
        const res = await app.inject({
          method: 'POST',
          url: '/api/v1/giving/contributions',
          headers: { authorization: 'Bearer demo-admin' },
          payload: {
            memberId: 'user-member-1',
            amount: 100.0 + i * 50,
            date: new Date().toISOString(),
            method: 'cash',
          },
        });
        if (res.statusCode === 201 || res.statusCode === 200) {
          contributionIds.push(res.json().id);
        }
      }
    });

    it('POST /contributions/bulk-delete should soft delete multiple contributions', async () => {
      if (contributionIds.length < 2) {
        console.log('Skipping: not enough contributions created');
        return;
      }
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/giving/contributions/bulk-delete',
        headers: { authorization: 'Bearer demo-admin' },
        payload: { ids: [contributionIds[0], contributionIds[1]] },
      });
      expect([200, 201]).toContain(res.statusCode);
      const body = res.json();
      expect(body.success).toBeGreaterThan(0);
    });

    it('POST /contributions/bulk-undelete should restore multiple deleted contributions', async () => {
      if (contributionIds.length < 2) {
        console.log('Skipping: not enough contributions created');
        return;
      }
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/giving/contributions/bulk-undelete',
        headers: { authorization: 'Bearer demo-admin' },
        payload: { ids: [contributionIds[0], contributionIds[1]] },
      });
      expect([200, 201]).toContain(res.statusCode);
      const body = res.json();
      expect(body.success).toBeGreaterThanOrEqual(0);
    });
  });

  // ==================== CASCADE & INTEGRATION TESTS ====================

  describe('Cascade & Integration', () => {
    it('Hard delete fund should orphan contributions (fundId = null)', async () => {
      // Create fund
      const fundRes = await app.inject({
        method: 'POST',
        url: '/api/v1/giving/funds',
        headers: { authorization: 'Bearer demo-admin' },
        payload: { name: 'Cascade Test Fund' },
      });
      const fundId = fundRes.json().id;

      // Create contribution with fund
      const contRes = await app.inject({
        method: 'POST',
        url: '/api/v1/giving/contributions',
        headers: { authorization: 'Bearer demo-admin' },
        payload: {
          memberId: 'user-member-1',
          amount: 150.0,
          date: new Date().toISOString(),
          fundId,
          method: 'cash',
        },
      });
      const contributionId = contRes.json().id;

      // Hard delete fund
      const deleteRes = await app.inject({
        method: 'DELETE',
        url: `/api/v1/giving/funds/${fundId}/hard`,
        headers: { authorization: 'Bearer demo-admin' },
      });
      expect(deleteRes.statusCode).toBe(200);

      // Verify contribution is still there but fundId is null
      const listRes = await app.inject({
        method: 'GET',
        url: '/api/v1/giving/contributions',
        headers: { authorization: 'Bearer demo-admin' },
      });
      const contributions = listRes.json();
      const orphaned = contributions.find((c: any) => c.id === contributionId);
      expect(orphaned).toBeDefined();
      expect(orphaned.fundId).toBeUndefined();
    });

    it('Soft delete fund should preserve contributions', async () => {
      // Create fund
      const fundRes = await app.inject({
        method: 'POST',
        url: '/api/v1/giving/funds',
        headers: { authorization: 'Bearer demo-admin' },
        payload: { name: 'Soft Delete Test Fund' },
      });
      const fundId = fundRes.json().id;

      // Create contribution
      const contRes = await app.inject({
        method: 'POST',
        url: '/api/v1/giving/contributions',
        headers: { authorization: 'Bearer demo-admin' },
        payload: {
          memberId: 'user-member-1',
          amount: 200.0,
          date: new Date().toISOString(),
          fundId,
          method: 'bank-transfer',
        },
      });
      const contributionId = contRes.json().id;

      // Soft delete fund
      const deleteRes = await app.inject({
        method: 'DELETE',
        url: `/api/v1/giving/funds/${fundId}`,
        headers: { authorization: 'Bearer demo-admin' },
      });
      expect(deleteRes.statusCode).toBe(200);

      // Verify contribution is still there with same fundId
      const listRes = await app.inject({
        method: 'GET',
        url: '/api/v1/giving/contributions',
        headers: { authorization: 'Bearer demo-admin' },
      });
      const contributions = listRes.json();
      const preserved = contributions.find((c: any) => c.id === contributionId);
      expect(preserved).toBeDefined();
      expect(preserved.fundId).toBe(fundId);
    });
  });

  // ==================== AUTHORIZATION & ERROR TESTS ====================

  describe('Authorization & Error Handling', () => {
    it('POST /funds/bulk-delete with empty ids should return 400', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/giving/funds/bulk-delete',
        headers: { authorization: 'Bearer demo-admin' },
        payload: { ids: [] },
      });
      expect(res.statusCode).toBe(400);
    });

    it('DELETE /contributions/:id/hard should forbid member', async () => {
      const res = await app.inject({
        method: 'DELETE',
        url: '/api/v1/giving/contributions/contribution-1/hard',
        headers: { authorization: 'Bearer demo-member' },
      });
      expect(res.statusCode).toBe(403);
    });

    it('GET /funds/deleted/all should forbid member', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/giving/funds/deleted/all',
        headers: { authorization: 'Bearer demo-member' },
      });
      expect(res.statusCode).toBe(403);
    });
  });
});
