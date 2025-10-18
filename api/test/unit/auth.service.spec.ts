import { AuthService } from '../../src/modules/auth/auth.service';
import { createDataStoreMock } from '../support/datastore.mock';

describe('AuthService', () => {
  const store = createDataStoreMock();
  const service = new AuthService(store);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('delegates login to the datastore', () => {
    const session = { token: 'demo', user: { id: 'user-1' } };
    store.createSession.mockReturnValue(session as any);

    const result = service.login('user@example.com', 'google', 'Admin');

    expect(store.createSession).toHaveBeenCalledWith('user@example.com', 'google', 'Admin');
    expect(result).toEqual(session);
  });

  it('resolves the current session from token', () => {
    store.getSessionByToken.mockReturnValue({ session: { token: 'demo' } } as any);

    const result = service.me('demo');

    expect(store.getSessionByToken).toHaveBeenCalledWith('demo');
    expect(result?.session.token).toBe('demo');
  });
});
