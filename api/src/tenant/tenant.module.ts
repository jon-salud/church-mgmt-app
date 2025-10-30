import { Module } from '@nestjs/common';
import { TenantProvisioningService } from './tenant-provisioning.service';
import { TenantProvisioningController } from './tenant-provisioning.controller';
import { SystemPrismaService } from '../prisma/prisma-multi-tenant.service';

@Module({
  providers: [TenantProvisioningService, SystemPrismaService],
  controllers: [TenantProvisioningController],
  exports: [TenantProvisioningService, SystemPrismaService],
})
export class TenantModule {}
