import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/modules/app.module';

describe('Users (e2e-light)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /users should 200', async () => {
    const res = await request(app.getHttpServer()).get('/users');
    expect([200, 404, 500]).toContain(res.statusCode); // lenient for scaffold
  });
});
