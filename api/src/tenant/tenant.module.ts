import { Module } from '@nestjs/common';
import { TenantProvisioningService } from './tenant-provisioning.service';
import { TenantProvisioningController } from './tenant-provisioning.controller';
import { TenantContextService } from './tenant-context.service';
import { SystemPrismaService } from '../prisma/prisma-multi-tenant.service';

@Module({
  providers: [TenantProvisioningService, TenantContextService, SystemPrismaService],
  controllers: [TenantProvisioningController],
  exports: [TenantProvisioningService, TenantContextService, SystemPrismaService],
})
export class TenantModule {}
