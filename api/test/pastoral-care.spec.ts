import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { bootstrapTestApp } from './support/e2e-bootstrap';

describe('Pastoral Care (e2e-light)', () => {
  let app: NestFastifyApplication;
  let createdTicketId: string;

  beforeAll(async () => {
    const result = await bootstrapTestApp();
    app = result.app;
  });

  afterAll(async () => {
    if (app && typeof app.close === 'function') {
      await app.close();
    }
  });

  it('POST /pastoral-care/tickets should create a ticket', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/pastoral-care/tickets',
      headers: { authorization: 'Bearer demo-admin' },
      payload: {
        title: 'Test Ticket',
        description: 'This is a test ticket.',
        priority: 'NORMAL',
      },
    });
    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body).toHaveProperty('id');
    createdTicketId = body.id;
  });

  it('GET /pastoral-care/tickets should list tickets', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/pastoral-care/tickets',
      headers: { authorization: 'Bearer demo-admin' },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
  });

  it('GET /pastoral-care/tickets/:id should retrieve a ticket', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/pastoral-care/tickets/${createdTicketId}`,
      headers: { authorization: 'Bearer demo-admin' },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body).toHaveProperty('id', createdTicketId);
  });

  it('PATCH /pastoral-care/tickets/:id should update a ticket', async () => {
    const res = await app.inject({
      method: 'PATCH',
      url: `/api/v1/pastoral-care/tickets/${createdTicketId}`,
      headers: { authorization: 'Bearer demo-admin' },
      payload: {
        status: 'IN_PROGRESS',
        assigneeId: 'user-leader',
      },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body).toHaveProperty('status', 'IN_PROGRESS');
    expect(body).toHaveProperty('assigneeId', 'user-leader');
  });

  it('POST /pastoral-care/tickets/:id/comments should add a comment', async () => {
    const res = await app.inject({
      method: 'POST',
      url: `/api/v1/pastoral-care/tickets/${createdTicketId}/comments`,
      headers: { authorization: 'Bearer demo-admin' },
      payload: {
        body: 'This is a test comment.',
      },
    });
    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body).toHaveProperty('id');
  });
});
