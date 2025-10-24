import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly config: ConfigService) {
    const clientID = config.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = config.get<string>('GOOGLE_CLIENT_SECRET');
    const callbackURL =
      config.get<string>('GOOGLE_CALLBACK_URL') ??
      `${config.get<string>('API_BASE_URL') ?? 'http://localhost:3001/api/v1'}/auth/google/callback`;

    const isDemoOnly = !clientID || !clientSecret;
    const allowDemo = (config.get<string>('ALLOW_DEMO_LOGIN') ?? 'true').toLowerCase() !== 'false';

    if (isDemoOnly && !allowDemo) {
      throw new Error(
        'Missing Google OAuth configuration. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.'
      );
    }

    super({
      clientID: isDemoOnly ? 'demo' : clientID!,
      clientSecret: isDemoOnly ? 'demo' : clientSecret!,
      callbackURL,
      scope: ['email', 'profile'],
      passReqToCallback: true,
    });
  }

  async validate(
    req: any,
    _accessToken: string,
    _refreshToken: string,
    profile: any,
    done: Function
  ) {
    const email = profile?.emails?.[0]?.value;
    if (!email) {
      return done(new Error('Google account does not have an email address available.'), false);
    }

    done(null, {
      provider: 'google',
      providerUserId: profile.id,
      email,
      firstName: profile?.name?.givenName,
      lastName: profile?.name?.familyName,
      picture: profile?.photos?.[0]?.value,
      state: (req.query?.state as string | undefined) ?? undefined,
    });
  }
}
