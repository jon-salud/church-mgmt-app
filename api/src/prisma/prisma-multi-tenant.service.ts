import { Injectable, OnModuleInit, INestApplication, Logger } from '@nestjs/common';
import { PrismaClient as SystemPrismaClient } from './system-client';
import { PrismaClient as TenantPrismaClient } from './tenant-client';

const mode = process.env.DATA_MODE ?? 'mock';
const isTestEnv = process.env.NODE_ENV === 'test';
const shouldUseStub = mode !== 'prisma' || isTestEnv;

let SystemPrismaClientClass: any;
let TenantPrismaClientClass: any;

if (!shouldUseStub) {
  try {
    SystemPrismaClientClass = SystemPrismaClient;
    TenantPrismaClientClass = TenantPrismaClient;
  } catch {
    SystemPrismaClientClass = undefined;
    TenantPrismaClientClass = undefined;
  }
}

if (!SystemPrismaClientClass || !TenantPrismaClientClass) {
  SystemPrismaClientClass = class {
    async $connect(): Promise<void> {
      console.warn(
        'System Prisma client is not generated. Run `pnpm prisma:generate` before using DATA_MODE=prisma.'
      );
    }
    $on(_event: string, _cb: (...args: any[]) => unknown): void {}
  };

  TenantPrismaClientClass = class {
    async $connect(): Promise<void> {
      console.warn(
        'Tenant Prisma client is not generated. Run `pnpm prisma:generate` before using DATA_MODE=prisma.'
      );
    }
    $on(_event: string, _cb: (...args: any[]) => unknown): void {}
  };
}

@Injectable()
export class SystemPrismaService extends SystemPrismaClientClass implements OnModuleInit {
  private readonly logger = new Logger(SystemPrismaService.name);

  constructor() {
    super({
      log: [
        { level: 'query', emit: 'event' },
        { level: 'info', emit: 'event' },
        { level: 'warn', emit: 'event' },
        { level: 'error', emit: 'event' },
      ],
    });

    if (mode === 'prisma') {
      this.$on('query', (e: any) => {
        this.logger.debug(`System DB Query: ${e.query} (${e.duration}ms)`);
      });
      this.$on('info', (e: any) => {
        this.logger.log(`System DB Info: ${e.message}`);
      });
      this.$on('warn', (e: any) => {
        this.logger.warn(`System DB Warning: ${e.message}`);
      });
      this.$on('error', (e: any) => {
        this.logger.error(`System DB Error: ${e.message}`);
      });
    }
  }

  async onModuleInit() {
    if (mode === 'prisma') {
      await this.$connect();
      this.logger.log('Connected to system metadata database');
    }
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }
}

@Injectable()
export class TenantPrismaService extends TenantPrismaClientClass implements OnModuleInit {
  private readonly logger = new Logger(TenantPrismaService.name);
  private tenantConnections = new Map<string, InstanceType<typeof TenantPrismaClientClass>>();

  constructor() {
    super({
      log: [
        { level: 'query', emit: 'event' },
        { level: 'info', emit: 'event' },
        { level: 'warn', emit: 'event' },
        { level: 'error', emit: 'event' },
      ],
    });

    if (mode === 'prisma') {
      this.$on('query', (e: any) => {
        this.logger.debug(`Tenant DB Query: ${e.query} (${e.duration}ms)`);
      });
      this.$on('info', (e: any) => {
        this.logger.log(`Tenant DB Info: ${e.message}`);
      });
      this.$on('warn', (e: any) => {
        this.logger.warn(`Tenant DB Warning: ${e.message}`);
      });
      this.$on('error', (e: any) => {
        this.logger.error(`Tenant DB Error: ${e.message}`);
      });
    }
  }

  async onModuleInit() {
    if (mode === 'prisma') {
      await this.$connect();
      this.logger.log('Connected to default tenant database');
    }
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }

  /**
   * Get or create a tenant-specific Prisma client
   * @param tenantId - The tenant identifier
   * @param databaseUrl - The database URL for the tenant
   * @returns TenantPrismaClient instance for the tenant
   */
  async getTenantClient(
    tenantId: string,
    databaseUrl: string
  ): Promise<InstanceType<typeof TenantPrismaClientClass>> {
    if (this.tenantConnections.has(tenantId)) {
      return this.tenantConnections.get(tenantId)!;
    }

    if (mode !== 'prisma') {
      // In mock mode, return the default client
      return this as InstanceType<typeof TenantPrismaClientClass>;
    }

    const tenantClient = new TenantPrismaClientClass({
      datasourceUrl: databaseUrl,
      log: [
        { level: 'query', emit: 'event' },
        { level: 'info', emit: 'event' },
        { level: 'warn', emit: 'event' },
        { level: 'error', emit: 'event' },
      ],
    });

    tenantClient.$on('query', (e: any) => {
      this.logger.debug(`Tenant ${tenantId} Query: ${e.query} (${e.duration}ms)`);
    });
    tenantClient.$on('info', (e: any) => {
      this.logger.log(`Tenant ${tenantId} Info: ${e.message}`);
    });
    tenantClient.$on('warn', (e: any) => {
      this.logger.warn(`Tenant ${tenantId} Warning: ${e.message}`);
    });
    tenantClient.$on('error', (e: any) => {
      this.logger.error(`Tenant ${tenantId} Error: ${e.message}`);
    });

    await tenantClient.$connect();
    this.tenantConnections.set(tenantId, tenantClient);

    this.logger.log(`Connected to tenant database: ${tenantId}`);

    return tenantClient;
  }

  /**
   * Disconnect a specific tenant client
   * @param tenantId - The tenant identifier
   */
  async disconnectTenantClient(tenantId: string): Promise<void> {
    const client = this.tenantConnections.get(tenantId);
    if (client) {
      await client.$disconnect();
      this.tenantConnections.delete(tenantId);
      this.logger.log(`Disconnected from tenant database: ${tenantId}`);
    }
  }

  /**
   * Disconnect all tenant clients
   */
  async disconnectAllTenantClients(): Promise<void> {
    for (const [tenantId, client] of Array.from(this.tenantConnections.entries())) {
      await client.$disconnect();
      this.logger.log(`Disconnected from tenant database: ${tenantId}`);
    }
    this.tenantConnections.clear();
  }
}
