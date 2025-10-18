import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { DemoAuthGuard } from './demo-auth.guard';

@Module({
  controllers: [AuthController],
  providers: [AuthService, DemoAuthGuard],
  exports: [AuthService, DemoAuthGuard],
})
export class AuthModule {}
