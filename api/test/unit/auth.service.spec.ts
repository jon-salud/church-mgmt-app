import { AuthService } from '../../src/modules/auth/auth.service';
import { createDataStoreMock } from '../support/datastore.mock';

const createConfigMock = (overrides: Record<string, unknown> = {}) => (
  {
    get: jest.fn((key: string) => overrides[key]),
  }
) as any;

const createService = () => {
  const store = createDataStoreMock();
  const config = createConfigMock({ ALLOW_DEMO_LOGIN: 'true' });
  return { store, service: new AuthService(store, config) };
};

describe('AuthService', () => {
  it('delegates login to the datastore', async () => {
    const { store, service } = createService();

    const session = { token: 'demo', user: { id: 'user-1' } };
    store.createSession.mockResolvedValue(session as any);

    const result = await service.login('user@example.com', 'google', 'Admin');

    expect(store.createSession).toHaveBeenCalledWith('user@example.com', 'google', 'Admin');
    expect(result).toEqual(session);
  });

  it('resolves the current session from token', async () => {
    const { store, service } = createService();
    store.getSessionByToken.mockResolvedValue({ session: { token: 'demo' } } as any);

    const result = await service.me('demo');

    expect(store.getSessionByToken).toHaveBeenCalledWith('demo');
    expect(result?.session.token).toBe('demo');
  });
});
