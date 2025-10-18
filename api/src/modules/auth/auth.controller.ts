import { Body, Controller, Get, Headers, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { DemoAuthGuard } from './demo-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    const { session, user } = this.authService.login(dto.email, dto.provider, dto.role);
    return {
      token: session.token,
      provider: session.provider,
      user,
    };
  }

  @UseGuards(DemoAuthGuard)
  @Get('me')
  me(@Headers('authorization') authorization?: string) {
    const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : authorization;
    const session = this.authService.me(token || undefined);
    if (!session) {
      return null;
    }
    return session;
  }
}
