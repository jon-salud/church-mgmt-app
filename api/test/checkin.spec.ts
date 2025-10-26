import { Test } from '@nestjs/testing';
import { AppModule } from '../src/modules/app.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { getAuthToken } from './support/get-auth-token';
import { MockDatabaseService } from '../src/mock/mock-database.service';
import { NotificationsService } from '../src/modules/notifications/notifications.service';

describe('Checkin (e2e-light)', () => {
  let app: NestFastifyApplication;
  let authToken: string;
  let householdId: string;
  let childId: string;
  let eventId: string;
  let checkinId: string;
  let mockDbService: MockDatabaseService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(NotificationsService)
      .useValue({
        processNotification: jest.fn(),
        sendNotification: jest.fn(),
      })
      .compile();
    const adapter = new FastifyAdapter();
    app = moduleRef.createNestApplication<NestFastifyApplication>(adapter);
    app.setGlobalPrefix('api/v1');
    await app.init();
    await adapter.getInstance().ready();

    mockDbService = app.get(MockDatabaseService);
    jest.spyOn(mockDbService, 'createAuditLog');

    authToken = await getAuthToken(app);

    const households = await app.inject({
      method: 'GET',
      url: '/api/v1/households',
      headers: {
        authorization: `Bearer ${authToken}`,
      },
    });
    householdId = households.json()[0].id;

    const events = await app.inject({
      method: 'GET',
      url: '/api/v1/events',
      headers: {
        authorization: `Bearer ${authToken}`,
      },
    });
    eventId = events.json()[0].id;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should reject unauthenticated requests', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/checkin/children',
      headers: {
        authorization: 'Bearer invalid-token',
      },
      payload: {
        householdId,
        fullName: 'Test Child',
        dateOfBirth: '2020-01-01',
      },
    });
    expect(res.statusCode).toBe(401);
  });

  it('should create a child', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/checkin/children',
      headers: {
        authorization: `Bearer ${authToken}`,
      },
      payload: {
        householdId,
        fullName: 'Test Child',
        dateOfBirth: '2020-01-01',
      },
    });
    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body).toHaveProperty('id');
    childId = body.id;

    expect(mockDbService.createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'child.created',
        entity: 'child',
        entityId: childId,
      })
    );
  });

  it('should update a child', async () => {
    const res = await app.inject({
      method: 'PATCH',
      url: `/api/v1/checkin/children/${childId}`,
      headers: {
        authorization: `Bearer ${authToken}`,
      },
      payload: {
        fullName: 'Test Child Updated',
      },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.fullName).toBe('Test Child Updated');

    expect(mockDbService.createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'child.updated',
        entity: 'child',
        entityId: childId,
      })
    );
  });

  it('should initiate a check-in', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/checkin/initiate',
      headers: {
        authorization: `Bearer ${authToken}`,
      },
      payload: {
        childIds: [childId],
        eventId,
      },
    });
    expect(res.statusCode).toBe(201);
    const body = res.json();
    checkinId = body[0].id;
  });

  it('should get checkins by eventId', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/checkin?eventId=${eventId}`,
      headers: {
        authorization: `Bearer ${authToken}`,
      },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body).toHaveLength(1);
    expect(body[0].id).toBe(checkinId);
  });

  it('should confirm a check-in', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/checkin/confirm',
      headers: {
        authorization: `Bearer ${authToken}`,
      },
      payload: {
        checkinId,
      },
    });
    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body.status).toBe('checked-in');
  });

  it('should initiate a check-out', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/checkin/checkout/initiate',
      headers: {
        authorization: `Bearer ${authToken}`,
      },
      payload: {
        checkinId,
      },
    });
    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body.status).toBe('checked-out');
  });

  it('should delete a child', async () => {
    const res = await app.inject({
      method: 'DELETE',
      url: `/api/v1/checkin/children/${childId}`,
      headers: {
        authorization: `Bearer ${authToken}`,
      },
    });
    expect(res.statusCode).toBe(200);

    expect(mockDbService.createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'child.deleted',
        entity: 'child',
        entityId: childId,
      })
    );
  });
});
