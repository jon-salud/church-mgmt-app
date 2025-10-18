import { GivingService } from '../../src/modules/giving/giving.service';
import { createDataStoreMock } from '../support/datastore.mock';

describe('GivingService', () => {
  const store = createDataStoreMock();
  const service = new GivingService(store);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns funds from the datastore', () => {
    const funds = [{ id: 'fund-1' }];
    store.listFunds.mockReturnValue(funds as any);

    const result = service.listFunds();

    expect(result).toEqual(funds);
    expect(store.listFunds).toHaveBeenCalledTimes(1);
  });

  it('filters contributions through datastore', () => {
    store.listContributions.mockReturnValue([{ id: 'contribution-1' }] as any);

    const result = service.listContributions({ memberId: 'user-1' });

    expect(store.listContributions).toHaveBeenCalledWith({ memberId: 'user-1' });
    expect(result[0].id).toBe('contribution-1');
  });

  it('records contribution attributing actor when provided', () => {
    const contribution = { id: 'contribution-new' };
    store.recordContribution.mockReturnValue(contribution as any);

    const result = service.recordContribution(
      {
        memberId: 'user-1',
        amount: 42,
        date: '2024-03-01',
        method: 'cash',
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
