
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/modules/app.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { RequestType } from '../src/mock/mock-data/request';

describe('Requests (e2e-light)', () => {
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

  it('POST /requests should create a request', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/requests',
      headers: { authorization: 'Bearer demo-admin' },
      payload: {
        type: RequestType.Suggestion,
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
