import { Injectable, Logger } from '@nestjs/common';
import { SystemPrismaService } from '../prisma/prisma-multi-tenant.service';
import { randomBytes } from 'crypto';

export interface TenantCreationRequest {
  name: string;
  subdomain: string;
  adminEmail: string;
  adminName: string;
  plan?: string;
  region?: string; // optional, kept for compatibility but not persisted to schema
}

export interface TenantCreationResponse {
  tenantId: string;
  databaseUrl: string;
  adminToken: string;
}

@Injectable()
export class TenantProvisioningService {
  private readonly logger = new Logger(TenantProvisioningService.name);

  constructor(private readonly systemPrisma: SystemPrismaService) {}

  /**
   * Create a new tenant with dedicated database
   */
  async createTenant(request: TenantCreationRequest): Promise<TenantCreationResponse> {
    const { name, subdomain, adminEmail, adminName, plan = 'free' } = request;

    // Generate unique tenant ID
    const tenantId = this.generateTenantId();

    // Check if subdomain is available
    const existingTenant = await this.systemPrisma.tenant.findUnique({
      where: { subdomain },
    });

    if (existingTenant) {
      throw new Error(`Subdomain '${subdomain}' is already taken`);
    }

    // Generate database name & URL for the tenant
    const databaseName = `churchapp_${tenantId}`;
    const databaseUrl = await this.createTenantDatabase(databaseName);

    // Create tenant record in system metadata (note: schema expects databaseName)
    await this.systemPrisma.tenant.create({
      data: {
        id: tenantId,
        name,
        subdomain,
        databaseName,
        databaseUrl,
        plan,
        status: 'provisioning',
        settings: {
          create: {
            // schema has a Json `features` field; include plan limits here
            features: {
              maxUsers: plan === 'free' ? 50 : plan === 'pro' ? 500 : 5000,
              maxStorageGb: plan === 'free' ? 1 : plan === 'pro' ? 10 : 100,
              planFeatures: this.getPlanFeatures(plan),
            },
          },
        },
        usage: {
          create: {
            databaseSizeMb: 0,
            activeUsers: 0,
            storageUsedMb: 0,
          },
        },
      },
    });

    // Create system admin user for the tenant
    // NOTE: system-schema.SystemUser does not include tenantId/name/apiToken fields —
    // store only the supported fields. The generated adminToken is returned to the caller
    // for initial setup but not persisted in SystemUser (consider a separate tokens table
    // for production)
    const adminToken = this.generateAdminToken();
    await this.systemPrisma.systemUser.create({
      data: {
        email: adminEmail,
        role: 'admin',
        status: 'active',
      },
    });

    // Initialize tenant database schema
    await this.initializeTenantDatabase(databaseUrl, tenantId, adminEmail, adminName);

    // Update tenant status to active
    await this.systemPrisma.tenant.update({
      where: { id: tenantId },
      data: { status: 'active' },
    });

    this.logger.log(`Tenant ${tenantId} (${subdomain}) provisioned successfully`);

    return {
      tenantId,
      databaseUrl,
      adminToken,
    };
  }

  /**
   * Deprovision a tenant (soft delete)
   */
  async deprovisionTenant(tenantId: string): Promise<void> {
    const tenant = await this.systemPrisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new Error(`Tenant ${tenantId} not found`);
    }

    if (tenant.status === 'deprovisioned') {
      throw new Error(`Tenant ${tenantId} is already deprovisioned`);
    }

    // Update tenant status
    await this.systemPrisma.tenant.update({
      where: { id: tenantId },
      data: { status: 'deprovisioned' },
    });

    // Log the deprovisioning. SystemAuditLog schema uses actorId rather than tenantId.
    await this.systemPrisma.systemAuditLog.create({
      data: {
        actorId: null,
        action: 'tenant_deprovisioned',
        entity: 'tenant',
        entityId: tenantId,
        details: { reason: 'admin_request' },
      },
    });

    this.logger.log(`Tenant ${tenantId} deprovisioned`);
  }

  /**
   * Get tenant information
   */
  async getTenant(tenantId: string) {
    return this.systemPrisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        settings: true,
        usage: true,
      },
    });
  }

  /**
   * Update tenant settings
   */
  async updateTenantSettings(tenantId: string, settings: Partial<Record<string, unknown>>) {
    return this.systemPrisma.tenantSettings.update({
      where: { tenantId },
      data: settings,
    });
  }

  /**
   * Get tenant usage statistics
   */
  async getTenantUsage(tenantId: string) {
    return this.systemPrisma.tenantUsage.findUnique({
      where: { tenantId },
    });
  }

  /**
   * Update tenant usage metrics
   */
  async updateTenantUsage(tenantId: string, usage: Partial<Record<string, unknown>>) {
    return this.systemPrisma.tenantUsage.update({
      where: { tenantId },
      data: usage,
    });
  }

  private generateTenantId(): string {
    return `tenant_${randomBytes(8).toString('hex')}`;
  }

  private generateAdminToken(): string {
    return `admin_${randomBytes(16).toString('hex')}`;
  }

  private async createTenantDatabase(databaseName: string): Promise<string> {
    // In a real implementation, this would:
    // 1. Call cloud provider API (AWS RDS, Google Cloud SQL, etc.)
    // 2. Create a new database instance
    // 3. Set up connection pooling
    // 4. Configure backups and monitoring

    // For now, return a placeholder database URL
    // This would be replaced with actual cloud database provisioning
    const dbHost = process.env.DB_HOST || 'localhost';
    const dbPort = process.env.DB_PORT || '5432';
    const dbName = databaseName;
    const dbUser = process.env.DB_USER || 'postgres';
    const dbPassword = process.env.DB_PASSWORD || 'password';

    return `postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`;
  }

  private async initializeTenantDatabase(
    databaseUrl: string,
    tenantId: string,
    _adminEmail: string,
    _adminName: string
  ): Promise<void> {
    // In a real implementation, this would:
    // 1. Run Prisma migrations on the new database
    // 2. Create initial admin user
    // 3. Set up default settings
    // 4. Initialize audit logs

    this.logger.log(`Initializing database for tenant ${tenantId}`);
    // TODO: Implement actual database initialization
  }

  private getPlanFeatures(plan: string): string[] {
    const baseFeatures = ['basic_members', 'events', 'announcements'];

    switch (plan) {
      case 'free':
        return baseFeatures;
      case 'pro':
        return [...baseFeatures, 'advanced_reporting', 'api_access', 'custom_fields'];
      case 'enterprise':
        return [
          ...baseFeatures,
          'advanced_reporting',
          'api_access',
          'custom_fields',
          'sso',
          'audit_logs',
        ];
      default:
        return baseFeatures;
    }
  }
}
