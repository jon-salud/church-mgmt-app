import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly config: ConfigService) {
    // Be defensive: tests may instantiate this strategy without a ConfigService present
    // (or without relevant env vars). Fall back to process.env and sensible defaults so
    // test modules don't fail during provider instantiation.
    const get = (key: string) => config?.get?.(key) ?? process.env[key];

    const clientID = get('GOOGLE_CLIENT_ID');
    const clientSecret = get('GOOGLE_CLIENT_SECRET');
    const callbackURL =
      get('GOOGLE_CALLBACK_URL') ??
      `${get('API_BASE_URL') ?? 'http://localhost:3001/api/v1'}/auth/google/callback`;

    const isDemoOnly = !clientID || !clientSecret;
    const allowDemo = ((get('ALLOW_DEMO_LOGIN') ?? 'true') as string).toLowerCase() !== 'false';

    // If demo login is disabled and OAuth isn't configured, throw as a safety guard in prod.
    // In test environments we prefer to fall back to demo mode instead of failing provider init.
    if (isDemoOnly && !allowDemo && process.env.NODE_ENV === 'production') {
      throw new Error(
        'Missing Google OAuth configuration. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.'
      );
    }

    super({
      clientID: isDemoOnly ? 'demo' : (clientID as string),
      clientSecret: isDemoOnly ? 'demo' : (clientSecret as string),
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
    done: (error: any, user?: any, info?: any) => void
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
