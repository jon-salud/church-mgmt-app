import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Secret, SignOptions, sign, verify } from 'jsonwebtoken';
import { DATA_STORE, DataStore } from '../../datastore';

interface JwtPayload {
  sub: string;
  email: string;
  roles: Array<{ churchId: string; roleId: string; role: string }>;
  provider?: 'google' | 'facebook' | 'demo';
}

interface OAuthProfile {
  provider: 'google' | 'facebook';
  providerUserId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  picture?: string;
}

interface OAuthStatePayload {
  redirect: string;
  provider: 'google' | 'facebook';
}

const DEFAULT_REDIRECT = '/dashboard';

const DEFAULT_JWT_EXPIRY = '1h';

const DEMO_TOKENS = new Set(['demo-admin', 'demo-leader', 'demo-member']);

const isJwtTokenError = (error: unknown): boolean =>
  typeof error === 'object' &&
  error !== null &&
  'name' in error &&
  error.name === 'JsonWebTokenError';

@Injectable()
export class AuthService {
  private readonly jwtSecret: Secret;
  private readonly jwtExpiresIn: SignOptions['expiresIn'];
  private readonly stateSecret: string;
  private readonly frontendBaseUrl: string;
  private readonly allowDemoLogin: boolean;
  private readonly oauthCallbackPath: string;

  constructor(
    @Inject(DATA_STORE) private readonly db: DataStore,
    private readonly config: ConfigService
  ) {
    this.jwtSecret = (this.config.get<string>('JWT_SECRET') ?? 'dev-insecure-secret') as Secret;
    this.jwtExpiresIn = (this.config.get<string>('JWT_EXPIRES_IN') ??
      DEFAULT_JWT_EXPIRY) as SignOptions['expiresIn'];
    this.stateSecret = this.config.get<string>('OAUTH_STATE_SECRET') ?? String(this.jwtSecret);
    this.frontendBaseUrl = this.config.get<string>('WEB_APP_URL') ?? 'http://localhost:3000';
    this.oauthCallbackPath =
      this.config.get<string>('OAUTH_REDIRECT_PATH') ?? '/(auth)/oauth/callback';
    this.allowDemoLogin =
      (this.config.get<string>('ALLOW_DEMO_LOGIN') ?? 'true').toLowerCase() !== 'false';
  }

  login(email: string, provider: 'google' | 'facebook' | 'demo', role?: string) {
    if (!this.allowDemoLogin) {
      throw new UnauthorizedException('Demo credential flow is disabled.');
    }
    return this.db.createSession(email, provider, role);
  }

  me(token?: string) {
    if (!token) return null;

    const jwtPayload = this.verifyJwt(token);
    if (jwtPayload) {
      return this.lookupUserForJwt(jwtPayload, token);
    }

    return this.db.getSessionByToken(token);
  }

  issueJwt(
    user: {
      id: string;
      primaryEmail: string;
      roles: Array<{ churchId: string; roleId?: string; role?: string }>;
    },
    provider: JwtPayload['provider']
  ) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.primaryEmail,
      roles: (user.roles ?? []).map(role => ({
        churchId: role.churchId,
        roleId: role.roleId ?? role.role ?? '',
        role: role.role ?? 'Unknown Role',
      })),
      provider,
    };
    return sign(payload, this.jwtSecret, { expiresIn: this.jwtExpiresIn });
  }

  verifyJwt(token: string) {
    try {
      return verify(token, this.jwtSecret) as JwtPayload;
    } catch (error) {
      if (isJwtTokenError(error)) {
        return null;
      }
      throw error;
    }
  }

  async lookupUserForJwt(payload: JwtPayload, token: string) {
    const user = await this.db.getUserById(payload.sub);
    if (!user) {
      return null;
    }
    return {
      session: { token, userId: user.id, provider: payload.provider ?? 'google' },
      user,
    };
  }

  generateOAuthState(provider: 'google' | 'facebook', redirect?: string) {
    const safeRedirect = this.ensureRedirectPath(redirect);
    const payload: OAuthStatePayload = {
      provider,
      redirect: safeRedirect,
    };
    return sign(payload, this.stateSecret, { expiresIn: '10m' });
  }

  parseOAuthState(state: string | undefined): OAuthStatePayload {
    if (!state) {
      return { provider: 'google', redirect: DEFAULT_REDIRECT };
    }
    try {
      const decoded = verify(state, this.stateSecret) as OAuthStatePayload;
      return {
        provider: decoded.provider,
        redirect: this.ensureRedirectPath(decoded.redirect),
      };
    } catch (error) {
      if (isJwtTokenError(error)) {
        return { provider: 'google', redirect: DEFAULT_REDIRECT };
      }
      throw error;
    }
  }

  ensureRedirectPath(redirect?: string) {
    if (!redirect || typeof redirect !== 'string') {
      return DEFAULT_REDIRECT;
    }
    if (!redirect.startsWith('/')) {
      return DEFAULT_REDIRECT;
    }
    return redirect;
  }

  buildFrontendRedirect(
    token: string,
    provider: 'google' | 'facebook',
    redirectPath: string,
    created: boolean
  ) {
    const url = new URL(this.oauthCallbackPath, this.frontendBaseUrl);
    url.searchParams.set('token', token);
    url.searchParams.set('provider', provider);
    url.searchParams.set('redirect', redirectPath);
    url.searchParams.set('created', created ? 'true' : 'false');
    return url.toString();
  }

  async upsertUserFromOAuth(profile: OAuthProfile) {
    return this.db.upsertUserFromOAuth(profile);
  }

  async resolveAuthBearer(token?: string) {
    let candidate = token;
    if (!candidate && this.allowDemoLogin) {
      candidate = 'demo-admin';
    }

    if (!candidate) return null;

    if (DEMO_TOKENS.has(candidate)) {
      return this.db.getSessionByToken(candidate);
    }

    const jwtPayload = this.verifyJwt(candidate);
    if (!jwtPayload) {
      return this.db.getSessionByToken(candidate);
    }
    return this.lookupUserForJwt(jwtPayload, candidate);
  }
}
