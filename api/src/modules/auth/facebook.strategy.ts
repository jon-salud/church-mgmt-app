import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-facebook';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(private readonly config?: ConfigService) {
    // Be defensive: in some test setups ConfigService may not be provided. Fall back to
    // process.env values so provider instantiation doesn't throw during tests.
    const get = (key: string) => config?.get?.(key) ?? process.env[key];

    const clientID = get('FACEBOOK_CLIENT_ID');
    const clientSecret = get('FACEBOOK_CLIENT_SECRET');
    const callbackURL =
      get('FACEBOOK_CALLBACK_URL') ??
      `${get('API_BASE_URL') ?? 'http://localhost:3001/api/v1'}/auth/facebook/callback`;

    const isDemoOnly = !clientID || !clientSecret;
    const allowDemo = ((get('ALLOW_DEMO_LOGIN') ?? 'true') as string).toLowerCase() !== 'false';

    // Only throw in production when demo mode is explicitly disabled. Tests should not
    // fail provider instantiation due to missing OAuth config.
    if (isDemoOnly && !allowDemo && process.env.NODE_ENV === 'production') {
      throw new Error(
        'Missing Facebook OAuth configuration. Set FACEBOOK_CLIENT_ID and FACEBOOK_CLIENT_SECRET.'
      );
    }

    super({
      clientID: isDemoOnly ? 'demo' : (clientID as string | undefined),
      clientSecret: isDemoOnly ? 'demo' : (clientSecret as string | undefined),
      callbackURL,
      profileFields: ['id', 'emails', 'name', 'picture.type(large)'],
      scope: ['email'],
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
      return done(new Error('Facebook account does not have an email address available.'), false);
    }

    done(null, {
      provider: 'facebook',
      providerUserId: profile.id,
      email,
      firstName: profile?.name?.givenName,
      lastName: profile?.name?.familyName,
      picture: profile?.photos?.[0]?.value,
      state: (req.query?.state as string | undefined) ?? undefined,
    });
  }
}
