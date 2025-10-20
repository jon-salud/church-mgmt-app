import { Test } from '@nestjs/testing';
import { AppModule } from '../src/modules/app.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

describe('Events (e2e-light)', () => {
  let app: NestFastifyApplication;
  let createdEventId: string;
  let targetGroupId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    const adapter = new FastifyAdapter();
    app = moduleRef.createNestApplication<NestFastifyApplication>(adapter);
    app.setGlobalPrefix('api/v1');
    await app.init();
    await adapter.getInstance().ready();

    const groupsResponse = await app.inject({ method: 'GET', url: '/api/v1/groups' });
    targetGroupId = groupsResponse.json()[0]?.id;
  });

  afterAll(async () => {
    await app.close();
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

  it('POST /events/:id/attendance should 201/200', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/events/event-sunday-service/attendance',
      payload: { userId: 'user-member-2', status: 'checkedIn' },
    });
    expect([200, 201]).toContain(res.statusCode);
    expect(res.json()).toHaveProperty('status', 'checkedIn');
  });
});
