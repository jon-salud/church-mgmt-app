import { Test } from '@nestjs/testing';
import { AppModule } from '../src/modules/app.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

describe('Users (e2e-light)', () => {
  let app: NestFastifyApplication;
  let createdUserId: string;
  let createdEventId: string;
  let targetGroupId: string;
  let memberRoleId: string;
  let leaderRoleId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    const adapter = new FastifyAdapter();
    app = moduleRef.createNestApplication<NestFastifyApplication>(adapter);
    app.setGlobalPrefix('api/v1');
    await app.init();
    await adapter.getInstance().ready();

    const rolesResponse = await app.inject({
      method: 'GET',
      url: '/api/v1/roles',
      headers: { authorization: 'Bearer demo-admin' },
    });
    const roles = rolesResponse.json() as Array<{ id: string; slug?: string; name: string }>;
    memberRoleId = roles.find(role => role.slug === 'member')?.id ?? roles[0]?.id;
    leaderRoleId = roles.find(role => role.slug === 'leader')?.id ?? memberRoleId;
    if (!memberRoleId || !leaderRoleId) {
      throw new Error('Seed roles not found for tests');
    }
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /users should 200', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/users' });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
  });

  it('GET /groups should 200', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/groups' });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body[0]).toHaveProperty('name');
    targetGroupId = body[0]?.id;
    expect(targetGroupId).toBeDefined();
  });

  it('POST /users should create user when admin', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/users',
      headers: { authorization: 'Bearer demo-admin' },
      payload: {
        primaryEmail: `qa-user-${Date.now()}@example.com`,
        firstName: 'Quality',
        lastName: 'Assurance',
        phone: '555-1234',
        roleIds: [memberRoleId],
        status: 'active',
      },
    });
    expect([200, 201]).toContain(res.statusCode);
    const body = res.json();
    expect(body).toHaveProperty('id');
    createdUserId = body.id;
  });

  it('PATCH /users/:id should update profile when admin', async () => {
    const res = await app.inject({
      method: 'PATCH',
      url: `/api/v1/users/${createdUserId}`,
      headers: { authorization: 'Bearer demo-admin' },
      payload: {
        phone: '555-9999',
        address: '123 Integration Ave',
        notes: 'Updated via automated test',
        status: 'invited',
        roleIds: [leaderRoleId],
      },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.profile.phone).toBe('555-9999');
    expect(body.roles[0].role).toBe('Leader');
    expect(body.roles[0].roleId).toBe(leaderRoleId);
  });

  it('POST /groups/:id/members should add user to group', async () => {
    const res = await app.inject({
      method: 'POST',
      url: `/api/v1/groups/${targetGroupId}/members`,
      headers: { authorization: 'Bearer demo-admin' },
      payload: {
        userId: createdUserId,
        role: 'Volunteer',
        status: 'Active',
      },
    });
    expect([200, 201]).toContain(res.statusCode);
    const body = res.json();
    expect(body).toMatchObject({ userId: createdUserId, role: 'Volunteer' });
  });

  it('PATCH /groups/:id/members/:userId should update membership', async () => {
    const res = await app.inject({
      method: 'PATCH',
      url: `/api/v1/groups/${targetGroupId}/members/${createdUserId}`,
      headers: { authorization: 'Bearer demo-admin' },
      payload: { role: 'Leader', status: 'Inactive' },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.role).toBe('Leader');
    expect(body.status).toBe('Inactive');
  });

  it('POST /events should create event when admin', async () => {
    const startAt = new Date(Date.now() + 3600_000).toISOString();
    const endAt = new Date(Date.now() + 7200_000).toISOString();
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/events',
      headers: { authorization: 'Bearer demo-admin' },
      payload: {
        title: 'QA Integration Event',
        description: 'Automated test fixture event',
        startAt,
        endAt,
        location: 'Conference Room',
        visibility: 'private',
        groupId: targetGroupId,
        tags: ['QA', 'Integration'],
      },
    });
    expect([200, 201]).toContain(res.statusCode);
    const body = res.json();
    expect(body).toHaveProperty('id');
    createdEventId = body.id;
  });

  it('PATCH /events/:id should update event when admin', async () => {
    const res = await app.inject({
      method: 'PATCH',
      url: `/api/v1/events/${createdEventId}`,
      headers: { authorization: 'Bearer demo-admin' },
      payload: {
        title: 'QA Integration Event (Updated)',
        tags: ['QA'],
        groupId: null,
      },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.title).toContain('Updated');
    expect(body.groupId).toBeUndefined();
  });

  it('DELETE /events/:id should remove event when admin', async () => {
    const res = await app.inject({
      method: 'DELETE',
      url: `/api/v1/events/${createdEventId}`,
      headers: { authorization: 'Bearer demo-admin' },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body).toMatchObject({ success: true });
  });

  it('DELETE /groups/:id/members/:userId should remove membership when admin', async () => {
    const res = await app.inject({
      method: 'DELETE',
      url: `/api/v1/groups/${targetGroupId}/members/${createdUserId}`,
      headers: { authorization: 'Bearer demo-admin' },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body).toMatchObject({ success: true });
  });

  it('DELETE /users/:id should remove user when admin', async () => {
    const res = await app.inject({
      method: 'DELETE',
      url: `/api/v1/users/${createdUserId}`,
      headers: { authorization: 'Bearer demo-admin' },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body).toMatchObject({ success: true });
  });

  it('POST /events/:id/attendance should 201/200', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/events/event-sunday-service/attendance',
      payload: { userId: 'user-member-2', status: 'checkedIn' },
    });
    expect([200, 201]).toContain(res.statusCode);
    expect(res.json()).toHaveProperty('status', 'checkedIn');
  });

  it('GET /announcements should include reads array', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/announcements' });
    expect(res.statusCode).toBe(200);
    expect(res.json()[0]).toHaveProperty('reads');
  });

  it('POST /announcements/:id/read should acknowledge', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/announcements/announcement-fundraiser/read',
    });
    expect([200, 201]).toContain(res.statusCode);
    expect(res.json()).toHaveProperty('announcementId', 'announcement-fundraiser');
  });

  it('POST /giving/contributions should record contribution', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/giving/contributions',
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
    const res = await app.inject({ method: 'GET', url: '/api/v1/dashboard/summary' });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body).toHaveProperty('memberCount');
    expect(body).toHaveProperty('upcomingEvents');
  });

  it('GET /audit should 200 with paged payload for admins', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/audit' });
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
