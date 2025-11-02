import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { bootstrapTestApp } from './support/e2e-bootstrap';

describe('Misc Endpoints (e2e-light)', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    const result = await bootstrapTestApp();
    app = result.app;
  });

  afterAll(async () => {
    if (app && typeof app.close === 'function') {
      await app.close();
    }
  });

  it('GET /announcements should include reads array', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/announcements',
      headers: { authorization: 'Bearer demo-admin' },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json()[0]).toHaveProperty('reads');
  });

  it('POST /announcements/:id/read should acknowledge', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/announcements/announcement-fundraiser/read',
      headers: { authorization: 'Bearer demo-admin' },
    });
    expect([200, 201]).toContain(res.statusCode);
    expect(res.json()).toHaveProperty('announcementId', 'announcement-fundraiser');
  });

  // Announcements Soft Delete Tests
  describe('Announcements Soft Delete Operations', () => {
    let testAnnouncementId: string;
    let secondAnnouncementId: string;

    beforeAll(async () => {
      // Use existing seed announcements for soft delete tests
      const listRes = await app.inject({
        method: 'GET',
        url: '/api/v1/announcements',
        headers: { authorization: 'Bearer demo-admin' },
      });
      const announcements = listRes.json();
      testAnnouncementId = announcements[0]?.id;
      secondAnnouncementId = announcements[1]?.id;

      if (!testAnnouncementId || !secondAnnouncementId) {
        throw new Error('Not enough seed announcements available for testing');
      }
    });

    afterAll(async () => {
      // Restore announcements if they were left in deleted state
      await app.inject({
        method: 'POST',
        url: `/api/v1/announcements/${testAnnouncementId}/undelete`,
        headers: { authorization: 'Bearer demo-admin' },
      });
      await app.inject({
        method: 'POST',
        url: `/api/v1/announcements/${secondAnnouncementId}/undelete`,
        headers: { authorization: 'Bearer demo-admin' },
      });
    });

    it('DELETE /announcements/:id should soft delete (archive) an announcement', async () => {
      const res = await app.inject({
        method: 'DELETE',
        url: `/api/v1/announcements/${testAnnouncementId}`,
        headers: { authorization: 'Bearer demo-admin' },
      });
      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body).toMatchObject({ success: true });

      // Verify announcement is not in regular list
      const listRes = await app.inject({
        method: 'GET',
        url: '/api/v1/announcements',
        headers: { authorization: 'Bearer demo-admin' },
      });
      const announcements = listRes.json();
      expect(announcements.find((a: any) => a.id === testAnnouncementId)).toBeUndefined();
    });

    it('GET /announcements/deleted/all should list archived announcements (admin only)', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/announcements/deleted/all',
        headers: { authorization: 'Bearer demo-admin' },
      });
      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(Array.isArray(body)).toBe(true);
      expect(body.find((a: any) => a.id === testAnnouncementId)).toBeDefined();
      expect(body.find((a: any) => a.id === testAnnouncementId).deletedAt).toBeDefined();
    });

    it('POST /announcements/:id/undelete should restore archived announcement', async () => {
      const res = await app.inject({
        method: 'POST',
        url: `/api/v1/announcements/${testAnnouncementId}/undelete`,
        headers: { authorization: 'Bearer demo-admin' },
      });
      expect([200, 201]).toContain(res.statusCode);
      const body = res.json();
      expect(body).toMatchObject({ success: true });

      // Verify announcement is back in regular list
      const listRes = await app.inject({
        method: 'GET',
        url: '/api/v1/announcements',
        headers: { authorization: 'Bearer demo-admin' },
      });
      const announcements = listRes.json();
      expect(announcements.find((a: any) => a.id === testAnnouncementId)).toBeDefined();
      expect(announcements.find((a: any) => a.id === testAnnouncementId).deletedAt).toBeUndefined();
    });

    it('POST /announcements/bulk-delete should archive multiple announcements', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/announcements/bulk-delete',
        headers: { authorization: 'Bearer demo-admin' },
        payload: {
          ids: [testAnnouncementId, secondAnnouncementId],
        },
      });
      expect([200, 201]).toContain(res.statusCode);
      const body = res.json();
      expect(body).toMatchObject({ success: true, count: 2 });

      // Verify both announcements are archived
      const listRes = await app.inject({
        method: 'GET',
        url: '/api/v1/announcements',
        headers: { authorization: 'Bearer demo-admin' },
      });
      const announcements = listRes.json();
      expect(announcements.find((a: any) => a.id === testAnnouncementId)).toBeUndefined();
      expect(announcements.find((a: any) => a.id === secondAnnouncementId)).toBeUndefined();
    });

    it('POST /announcements/bulk-undelete should restore multiple archived announcements', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/announcements/bulk-undelete',
        headers: { authorization: 'Bearer demo-admin' },
        payload: {
          ids: [testAnnouncementId, secondAnnouncementId],
        },
      });
      expect([200, 201]).toContain(res.statusCode);
      const body = res.json();
      expect(body).toMatchObject({ success: true, count: 2 });

      // Verify both announcements are restored
      const listRes = await app.inject({
        method: 'GET',
        url: '/api/v1/announcements',
        headers: { authorization: 'Bearer demo-admin' },
      });
      const announcements = listRes.json();
      expect(announcements.find((a: any) => a.id === testAnnouncementId)).toBeDefined();
      expect(announcements.find((a: any) => a.id === secondAnnouncementId)).toBeDefined();
    });

    it('DELETE endpoints should require admin role', async () => {
      // Test with member token (non-admin)
      const res = await app.inject({
        method: 'DELETE',
        url: `/api/v1/announcements/${testAnnouncementId}`,
        headers: { authorization: 'Bearer demo-member' },
      });
      expect([401, 403]).toContain(res.statusCode);
    });
  });

  it('POST /giving/contributions should record contribution', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/giving/contributions',
      headers: { authorization: 'Bearer demo-admin' },
      payload: {
        memberId: 'user-member-3',
        amount: 25,
        date: '2024-03-10',
        method: 'cash',
        note: 'Integration test',
      },
    });
    expect([200, 201]).toContain(res.statusCode);
    const body = res.json();
    expect(body).toMatchObject({
      memberId: 'user-member-3',
      amount: 25,
      note: 'Integration test',
    });
  });

  it('GET /dashboard/summary should surface snapshot', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/dashboard/summary',
      headers: { authorization: 'Bearer demo-admin' },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body).toHaveProperty('memberCount');
    expect(body).toHaveProperty('upcomingEvents');
  });

  it('GET /audit should 200 with paged payload for admins', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/audit',
      headers: { authorization: 'Bearer demo-admin' },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(Array.isArray(body.items)).toBe(true);
    expect(body.meta).toHaveProperty('total');
  });

  it('GET /audit should 403 for non-admin token', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/audit',
      headers: { authorization: 'Bearer demo-member' },
    });
    expect(res.statusCode).toBe(403);
  });
});
