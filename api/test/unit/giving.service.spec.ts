import { GivingService } from '../../src/modules/giving/giving.service';
import { createDataStoreMock } from '../support/datastore.mock';

describe('GivingService', () => {
  const store = createDataStoreMock();
  const service = new GivingService(store);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns funds from the datastore', async () => {
    const funds = [{ id: 'fund-1' }];
    store.listFunds.mockResolvedValue(funds as any);

    const result = await service.listFunds();

    expect(result).toEqual(funds);
    expect(store.listFunds).toHaveBeenCalledTimes(1);
  });

  it('filters contributions through datastore', async () => {
    store.listContributions.mockResolvedValue([{ id: 'contribution-1' }] as any);

    const result = await service.listContributions({ memberId: 'user-1' });

    expect(store.listContributions).toHaveBeenCalledWith({ memberId: 'user-1' });
    expect(result[0].id).toBe('contribution-1');
  });

  it('records contribution attributing actor when provided', async () => {
    const contribution = { id: 'contribution-new' };
    store.recordContribution.mockResolvedValue(contribution as any);

    const result = await service.recordContribution(
      {
        memberId: 'user-1',
        amount: 42,
        date: '2024-03-01',
        method: 'cash' as const,
      },
      'admin-user',
    );

    expect(store.recordContribution).toHaveBeenCalledWith({
      memberId: 'user-1',
      amount: 42,
      date: '2024-03-01',
      method: 'cash',
      recordedBy: 'admin-user',
    });
    expect(result).toEqual(contribution);
  });
});
