import { AuthService } from '../../src/modules/auth/auth.service';
import { createDataStoreMock } from '../support/datastore.mock';

describe('AuthService', () => {
  const store = createDataStoreMock();
  const service = new AuthService(store);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('delegates login to the datastore', async () => {
    const session = { token: 'demo', user: { id: 'user-1' } };
    store.createSession.mockResolvedValue(session as any);

    const result = await service.login('user@example.com', 'google', 'Admin');

    expect(store.createSession).toHaveBeenCalledWith('user@example.com', 'google', 'Admin');
    expect(result).toEqual(session);
  });

  it('resolves the current session from token', async () => {
    store.getSessionByToken.mockResolvedValue({ session: { token: 'demo' } } as any);

    const result = await service.me('demo');

    expect(store.getSessionByToken).toHaveBeenCalledWith('demo');
    expect(result?.session.token).toBe('demo');
  });
});
