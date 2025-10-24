import { Test } from '@nestjs/testing';
import { AppModule } from '../src/modules/app.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

describe('Groups (e2e-light)', () => {
  let app: NestFastifyApplication;
  let createdUserId: string;
  let targetGroupId: string;
  let memberRoleId: string;

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
    if (!memberRoleId) {
      throw new Error('Seed roles not found for tests');
    }

    const userResponse = await app.inject({
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
    createdUserId = userResponse.json().id;
  });

  afterAll(async () => {
    await app.inject({
      method: 'DELETE',
      url: `/api/v1/users/${createdUserId}`,
      headers: { authorization: 'Bearer demo-admin' },
    });
    await app.close();
  });

  it('GET /groups should 200', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/groups' });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body[0]).toHaveProperty('name');
    targetGroupId = body[0]?.id;
    expect(targetGroupId).toBeDefined();
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
});
