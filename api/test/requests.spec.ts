import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { bootstrapTestApp } from './support/e2e-bootstrap';

describe('Requests (e2e-light)', () => {
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

  it('POST /requests should create a request', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/requests',
      headers: { authorization: 'Bearer demo-admin' },
      payload: {
        requestTypeId: 'req-type-4',
        title: 'New Youth Group Activity',
        body: 'We should organize a hiking trip.',
      },
    });
    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body).toHaveProperty('id');
  });

  it('GET /requests should list requests', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/requests',
      headers: { authorization: 'Bearer demo-admin' },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
  });
});
