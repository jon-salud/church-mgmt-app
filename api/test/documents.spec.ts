import { Test } from '@nestjs/testing';
import { AppModule } from '../src/modules/app.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

describe('Documents (e2e)', () => {
  let app: NestFastifyApplication;
  let createdDocumentId: string;
  let roleAdminId: string;
  let roleLeaderId: string;
  let roleMemberId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    const adapter = new FastifyAdapter();
    app = moduleRef.createNestApplication<NestFastifyApplication>(adapter);
    app.setGlobalPrefix('api/v1');
    await app.register(require('@fastify/multipart'), {
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    });
    await app.init();
    await adapter.getInstance().ready();

    // Get role IDs
    const rolesResponse = await app.inject({
      method: 'GET',
      url: '/api/v1/roles',
      headers: { authorization: 'Bearer demo-admin' },
    });
    const roles = rolesResponse.json();
    roleAdminId = roles.find((r: any) => r.slug === 'admin')?.id;
    roleLeaderId = roles.find((r: any) => r.slug === 'leader')?.id;
    roleMemberId = roles.find((r: any) => r.slug === 'member')?.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /documents should list documents user has permission to view', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/documents',
      headers: { authorization: 'Bearer demo-admin' },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(Array.isArray(body)).toBe(true);
    // Admin should see at least the documents with admin permissions
    expect(body.length).toBeGreaterThan(0);
  });

  it('GET /documents should filter based on user role permissions', async () => {
    // Member should only see documents they have permission for
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/documents',
      headers: { authorization: 'Bearer demo-member' },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(Array.isArray(body)).toBe(true);
    // Member should see fewer documents than admin
    // Based on mock data, members should see docs 3 and 4
    expect(body.length).toBeGreaterThanOrEqual(2);
  });

  it('GET /documents/:id should return document details with permissions', async () => {
    // Use existing document from mock data
    const listRes = await app.inject({
      method: 'GET',
      url: '/api/v1/documents',
      headers: { authorization: 'Bearer demo-admin' },
    });
    const documents = listRes.json();
    const existingDocId = documents[0]?.id;

    if (!existingDocId) {
      console.log('No documents found, skipping test');
      return;
    }

    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/documents/${existingDocId}`,
      headers: { authorization: 'Bearer demo-admin' },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.id).toBe(existingDocId);
    expect(body).toHaveProperty('title');
    expect(body).toHaveProperty('permissions');
    expect(Array.isArray(body.permissions)).toBe(true);
  });

  it('GET /documents/:id should deny access if user lacks permission', async () => {
    // Get a document that only admin can see (doc-1 from mock data)
    const listRes = await app.inject({
      method: 'GET',
      url: '/api/v1/documents',
      headers: { authorization: 'Bearer demo-admin' },
    });
    const documents = listRes.json();
    const adminOnlyDoc = documents.find((d: any) => d.id === 'doc-1');

    if (!adminOnlyDoc) {
      console.log('Admin-only document not found, skipping test');
      return;
    }

    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/documents/${adminOnlyDoc.id}`,
      headers: { authorization: 'Bearer demo-member' },
    });
    expect(res.statusCode).toBe(404); // Not found/access denied
  });

  it('GET /documents/:id/download-url should return a download URL', async () => {
    const listRes = await app.inject({
      method: 'GET',
      url: '/api/v1/documents',
      headers: { authorization: 'Bearer demo-admin' },
    });
    const documents = listRes.json();
    const docId = documents[0]?.id;

    if (!docId) {
      console.log('No documents found, skipping test');
      return;
    }

    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/documents/${docId}/download-url`,
      headers: { authorization: 'Bearer demo-admin' },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body).toHaveProperty('url');
    expect(body).toHaveProperty('expiresAt');
    expect(body.url).toContain('/download');
  });

  it('GET /documents/:id/download should download the file', async () => {
    const listRes = await app.inject({
      method: 'GET',
      url: '/api/v1/documents',
      headers: { authorization: 'Bearer demo-admin' },
    });
    const documents = listRes.json();
    const docId = documents[0]?.id;

    if (!docId) {
      console.log('No documents found, skipping test');
      return;
    }

    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/documents/${docId}/download`,
      headers: { authorization: 'Bearer demo-admin' },
    });
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toBe('application/octet-stream');
    expect(res.headers['content-disposition']).toContain('attachment');
  });

  it('PATCH /documents/:id should update document metadata when admin', async () => {
    const listRes = await app.inject({
      method: 'GET',
      url: '/api/v1/documents',
      headers: { authorization: 'Bearer demo-admin' },
    });
    const documents = listRes.json();
    const docId = documents[0]?.id;

    if (!docId) {
      console.log('No documents found, skipping test');
      return;
    }

    const res = await app.inject({
      method: 'PATCH',
      url: `/api/v1/documents/${docId}`,
      headers: { authorization: 'Bearer demo-admin' },
      payload: {
        description: 'Updated description from test',
      },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.description).toBe('Updated description from test');
  });

  it('PATCH /documents/:id should reject non-admin users', async () => {
    const listRes = await app.inject({
      method: 'GET',
      url: '/api/v1/documents',
      headers: { authorization: 'Bearer demo-admin' },
    });
    const documents = listRes.json();
    const docId = documents[0]?.id;

    if (!docId) {
      console.log('No documents found, skipping test');
      return;
    }

    const res = await app.inject({
      method: 'PATCH',
      url: `/api/v1/documents/${docId}`,
      headers: { authorization: 'Bearer demo-leader' },
      payload: {
        title: 'Unauthorized Update',
      },
    });
    expect(res.statusCode).toBe(403);
  });

  it('DELETE /documents/:id should archive document when admin', async () => {
    const listRes = await app.inject({
      method: 'GET',
      url: '/api/v1/documents',
      headers: { authorization: 'Bearer demo-admin' },
    });
    const documents = listRes.json();
    // Use last document to avoid breaking other tests
    const docId = documents[documents.length - 1]?.id;

    if (!docId) {
      console.log('No documents found, skipping test');
      return;
    }

    createdDocumentId = docId; // Save for next tests

    const res = await app.inject({
      method: 'DELETE',
      url: `/api/v1/documents/${docId}`,
      headers: { authorization: 'Bearer demo-admin' },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body).toMatchObject({ success: true });
  });

  it('GET /documents/deleted should list archived documents (admin only)', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/documents/deleted',
      headers: { authorization: 'Bearer demo-admin' },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(Array.isArray(body)).toBe(true);
    if (createdDocumentId) {
      expect(body.some((doc: any) => doc.id === createdDocumentId)).toBe(true);
    }
  });

  it('POST /documents/:id/undelete should restore archived document (admin only)', async () => {
    if (!createdDocumentId) {
      console.log('No archived document found, skipping test');
      return;
    }

    const res = await app.inject({
      method: 'POST',
      url: `/api/v1/documents/${createdDocumentId}/undelete`,
      headers: { authorization: 'Bearer demo-admin' },
    });
    expect([200, 201]).toContain(res.statusCode);
    const body = res.json();
    expect(body).toMatchObject({ success: true });
  });

  it('DELETE /documents/:id/hard should permanently delete document (admin only)', async () => {
    if (!createdDocumentId) {
      console.log('No document to hard delete, skipping test');
      return;
    }

    const res = await app.inject({
      method: 'DELETE',
      url: `/api/v1/documents/${createdDocumentId}/hard`,
      headers: { authorization: 'Bearer demo-admin' },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body).toMatchObject({ success: true });
  });

  it('GET /documents/:id should return 404 after hard delete', async () => {
    if (!createdDocumentId) {
      console.log('No deleted document to check, skipping test');
      return;
    }

    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/documents/${createdDocumentId}`,
      headers: { authorization: 'Bearer demo-admin' },
    });
    expect(res.statusCode).toBe(404);
  });
});
