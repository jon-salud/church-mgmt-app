import { Test } from '@nestjs/testing';
import { AppModule } from '../src/modules/app.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { bootstrapTestApp } from './support/e2e-bootstrap';

describe('Users (e2e-light)', () => {
  let app: NestFastifyApplication;
  let createdUserId: string;
  let memberRoleId: string;
  let leaderRoleId: string;

  beforeAll(async () => {
    const result = await bootstrapTestApp();
    app = result.app;

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
    await app.inject({
      method: 'DELETE',
      url: `/api/v1/users/${createdUserId}`,
      headers: { authorization: 'Bearer demo-admin' },
    });
    await app.close();
  });

  it('GET /users should 200', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/users' });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
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
});
