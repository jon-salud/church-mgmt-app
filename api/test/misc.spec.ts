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
