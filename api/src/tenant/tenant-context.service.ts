import { Injectable, ExecutionContext, Logger } from '@nestjs/common';
import { FastifyRequest } from 'fastify';

export interface TenantContext {
  tenantId: string;
  databaseUrl?: string;
}

@Injectable()
export class TenantContextService {
  private readonly logger = new Logger(TenantContextService.name);

  /**
   * Extract tenant context from the current execution context
   */
  getTenantContext(context: ExecutionContext): TenantContext {
    const request = context.switchToHttp().getRequest<FastifyRequest>();

    // For now, extract from header or default to 'default-tenant'
    // In production, this would be more sophisticated
    return {
      tenantId: this.extractTenantId(request),
      // databaseUrl would be resolved from tenant metadata in system DB
    };
  }

  /**
   * Extract tenant ID from request
   * Priority order:
   * 1. X-Tenant-ID header
   * 2. subdomain (if applicable)
   * 3. JWT token claims
   * 4. Default fallback
   */
  private extractTenantId(request: FastifyRequest): string {
    // Check header first
    const headerTenantId = request.headers['x-tenant-id'] as string;
    if (headerTenantId) {
      this.logger.debug(`Tenant ID from header: ${headerTenantId}`);
      return headerTenantId;
    }

    // Check hostname for subdomain
    const hostname = request.hostname;
    if (hostname && hostname !== 'localhost' && hostname.includes('.')) {
      const subdomain = hostname.split('.')[0];
      if (subdomain && subdomain !== 'www') {
        this.logger.debug(`Tenant ID from subdomain: ${subdomain}`);
        return subdomain;
      }
    }

    // For development/demo purposes, use default tenant
    this.logger.debug('Using default tenant ID');
    return 'default-tenant';
  }

  /**
   * Get tenant database URL from system metadata
   * In a real implementation, this would query the system database
   */
  async getTenantDatabaseUrl(_tenantId: string): Promise<string> {
    // For now, use environment variable
    // In production, this would query system DB for tenant metadata
    const baseUrl = process.env.DATABASE_URL;
    if (!baseUrl) {
      throw new Error('DATABASE_URL environment variable not set');
    }

    // For multi-tenant, you might modify the database name or connection string
    // For now, we'll use the same database but with tenant isolation in queries
    return baseUrl;
  }
}
