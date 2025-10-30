import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { bootstrapTestApp } from './support/e2e-bootstrap';

describe('Roles (e2e-light)', () => {
  let app: NestFastifyApplication;
  beforeAll(async () => {
    const result = await bootstrapTestApp();
    app = result.app;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /roles should 200', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/roles',
      headers: { authorization: 'Bearer demo-admin' },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
    expect(body[0]).toHaveProperty('id');
    expect(body[0]).toHaveProperty('name');
  });
});
