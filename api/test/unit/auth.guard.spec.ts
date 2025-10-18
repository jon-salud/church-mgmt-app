import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '../../src/modules/auth/auth.guard';

const createExecutionContext = (headers: Record<string, string> = {}) =>
  ({
    switchToHttp: () => ({
      getRequest: () => ({ headers, user: undefined }),
    }),
  }) as unknown as ExecutionContext;

describe('AuthGuard', () => {
  const authService = {
    resolveAuthBearer: jest.fn(),
  } as any;

  const guard = new AuthGuard(authService);

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('attaches verified session to the request', async () => {
    const context = createExecutionContext({ authorization: 'Bearer token-123' });
    authService.resolveAuthBearer.mockResolvedValue({
      session: { token: 'token-123' },
      user: { id: 'user-id', primaryEmail: 'user@example.com', roles: [], profile: {} },
    });

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(authService.resolveAuthBearer).toHaveBeenCalledWith('token-123');
  });

  it('throws when credentials are missing', async () => {
    const context = createExecutionContext();
    authService.resolveAuthBearer.mockResolvedValue(null);

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });
});
