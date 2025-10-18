import { Injectable, OnModuleInit, INestApplication } from '@nestjs/common';

const mode = process.env.DATA_MODE ?? 'mock';
const isTestEnv = process.env.NODE_ENV === 'test';
const shouldUseStub = mode !== 'prisma' || isTestEnv;

let PrismaClient: any;
if (!shouldUseStub) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    PrismaClient = require('@prisma/client').PrismaClient;
  } catch {
    PrismaClient = undefined;
  }
}

if (!PrismaClient) {
  PrismaClient = class {
    async $connect(): Promise<void> {
      // eslint-disable-next-line no-console
      console.warn('Prisma client is not generated. Run `pnpm prisma:generate` before using DATA_MODE=prisma.');
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    $on(_event: string, _cb: (...args: any[]) => unknown): void {}
  };
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }
}
