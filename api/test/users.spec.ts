import { Test } from '@nestjs/testing';
import { AppModule } from '../src/modules/app.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

describe('Users (e2e-light)', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    const adapter = new FastifyAdapter();
    app = moduleRef.createNestApplication<NestFastifyApplication>(adapter);
    app.setGlobalPrefix('api/v1');
    await app.init();
    await adapter.getInstance().ready();
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
