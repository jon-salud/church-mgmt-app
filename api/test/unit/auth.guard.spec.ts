import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { vi, describe, it, expect, beforeEach } from 'vitest';
// Import AuthGuard directly to bypass any global mocking
import { AuthGuard } from '../../src/modules/auth/auth.guard';

const createExecutionContext = (
  requestOverrides: Partial<{
    headers: Record<string, string>;
    cookies: Record<string, string>;
  }> = {}
) =>
  ({
    switchToHttp: () => ({
      getRequest: () => ({
        headers: requestOverrides.headers ?? {},
        cookies: requestOverrides.cookies,
        user: undefined,
      }),
    }),
  }) as unknown as ExecutionContext;

describe('AuthGuard', () => {
  const authService = {
    resolveAuthBearer: vi.fn(),
  } as any;

  const guard = new AuthGuard(authService);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('attaches verified session to the request', async () => {
    const context = createExecutionContext({ headers: { authorization: 'Bearer token-123' } });
    authService.resolveAuthBearer.mockResolvedValue({
      session: { token: 'token-123' },
      user: {
        id: 'user-id',
        primaryEmail: 'user@example.com',
        roles: [],
        profile: {},
        status: 'active',
      },
    });

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(authService.resolveAuthBearer).toHaveBeenCalledWith('token-123');
  });

  it('falls back to session cookie when header is missing', async () => {
    const context = createExecutionContext({
      headers: { cookie: 'session_token=cookie-token-789; other=1' },
      cookies: { session_token: 'cookie-token-789' },
    });
    authService.resolveAuthBearer.mockResolvedValue({
      session: { token: 'cookie-token-789' },
      user: {
        id: 'user-id',
        primaryEmail: 'user@example.com',
        roles: [],
        profile: {},
        status: 'active',
      },
    });

    await guard.canActivate(context);

    expect(authService.resolveAuthBearer).toHaveBeenCalledWith('cookie-token-789');
  });

  it('throws when credentials are missing', async () => {
    const context = createExecutionContext();
    authService.resolveAuthBearer.mockResolvedValue(null);

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('blocks non-active accounts', async () => {
    const context = createExecutionContext({ headers: { authorization: 'demo-token' } });
    authService.resolveAuthBearer.mockResolvedValue({
      session: { token: 'demo-token' },
      user: {
        id: 'user-id',
        primaryEmail: 'user@example.com',
        roles: [],
        profile: {},
        status: 'invited',
      },
    });

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });
});
