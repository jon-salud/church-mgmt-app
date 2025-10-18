import { Global, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { GoogleStrategy } from './google.strategy';
import { FacebookStrategy } from './facebook.strategy';
import { GoogleOAuthStartGuard } from './google-oauth-start.guard';
import { GoogleOAuthCallbackGuard } from './google-oauth-callback.guard';
import { FacebookOAuthStartGuard } from './facebook-oauth-start.guard';
import { FacebookOAuthCallbackGuard } from './facebook-oauth-callback.guard';

@Global()
@Module({
  imports: [PassportModule.register({ session: false })],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthGuard,
    GoogleStrategy,
    FacebookStrategy,
    GoogleOAuthStartGuard,
    GoogleOAuthCallbackGuard,
    FacebookOAuthStartGuard,
    FacebookOAuthCallbackGuard,
  ],
  exports: [AuthService, AuthGuard],
})
export class AuthModule {}
