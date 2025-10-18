import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { DemoAuthGuard } from '../../src/modules/auth/demo-auth.guard';
import { createDataStoreMock } from '../support/datastore.mock';

const createExecutionContext = (headers: Record<string, string> = {}) =>
  ({
    switchToHttp: () => ({
      getRequest: () => ({ headers, user: undefined }),
    }),
  }) as unknown as ExecutionContext;

describe('DemoAuthGuard', () => {
  const store = createDataStoreMock();
  const guard = new DemoAuthGuard(store);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('allows requests when token resolves to a session', async () => {
    store.getSessionByToken.mockResolvedValue({
      session: { token: 'demo-admin' },
      user: { id: 'user-admin', primaryEmail: 'admin@example.com', roles: [], profile: {} },
    } as any);
    const context = createExecutionContext({ authorization: 'Bearer demo-admin' });

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(store.getSessionByToken).toHaveBeenCalledWith('demo-admin');
  });

  it('falls back to demo-admin token when header is missing', async () => {
    store.getSessionByToken.mockResolvedValue({
      session: { token: 'demo-admin' },
      user: { id: 'user-admin', primaryEmail: 'admin@example.com', roles: [], profile: {} },
    } as any);
    const context = createExecutionContext();

    await guard.canActivate(context);

    expect(store.getSessionByToken).toHaveBeenCalledWith('demo-admin');
  });

  it('throws when session cannot be resolved', async () => {
    store.getSessionByToken.mockResolvedValue(null);
    const context = createExecutionContext({ authorization: 'Bearer invalid' });

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });
});
