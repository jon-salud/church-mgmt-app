import { Controller, Post, Body, Get, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { TenantProvisioningService, TenantCreationRequest } from './tenant-provisioning.service';
import { AuthGuard } from '../modules/auth/auth.guard';

@Controller('system/tenants')
export class TenantProvisioningController {
  constructor(private readonly tenantService: TenantProvisioningService) {}

  /**
   * Create a new tenant (public endpoint for self-service signup)
   */
  @Post()
  async createTenant(@Body() request: TenantCreationRequest) {
    return this.tenantService.createTenant(request);
  }

  /**
   * Get tenant information (admin only)
   */
  @UseGuards(AuthGuard)
  @Get(':tenantId')
  async getTenant(@Param('tenantId') tenantId: string) {
    return this.tenantService.getTenant(tenantId);
  }

  /**
   * Update tenant settings (admin only)
   */
  @UseGuards(AuthGuard)
  @Put(':tenantId/settings')
  async updateTenantSettings(@Param('tenantId') tenantId: string, @Body() settings: any) {
    return this.tenantService.updateTenantSettings(tenantId, settings);
  }

  /**
   * Get tenant usage statistics (admin only)
   */
  @UseGuards(AuthGuard)
  @Get(':tenantId/usage')
  async getTenantUsage(@Param('tenantId') tenantId: string) {
    return this.tenantService.getTenantUsage(tenantId);
  }

  /**
   * Deprovision tenant (admin only)
   */
  @UseGuards(AuthGuard)
  @Delete(':tenantId')
  async deprovisionTenant(@Param('tenantId') tenantId: string) {
    await this.tenantService.deprovisionTenant(tenantId);
    return { message: 'Tenant deprovisioned successfully' };
  }
}
