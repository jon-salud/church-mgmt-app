import { GivingService } from '../../src/modules/giving/giving.service';
import { createDataStoreMock } from '../support/datastore.mock';

describe('GivingService', () => {
  const store = createDataStoreMock();
  const service = new GivingService(store);

  beforeEach(() => {
    jest.clearAllMocks();
    store.getChurch.mockResolvedValue({ id: 'church-1' } as any);
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

  it('provides giving summary for the current church', async () => {
    store.getGivingSummary.mockResolvedValue({ totals: { overall: 100 } } as any);

    const summary = await service.summary();

    expect(store.getChurch).toHaveBeenCalled();
    expect(store.getGivingSummary).toHaveBeenCalledWith('church-1');
    expect(summary.totals.overall).toBe(100);
  });

  it('updates contributions via datastore with cleanup helpers', async () => {
    store.updateContribution.mockResolvedValue({ id: 'contribution-1', amount: 75 } as any);

    const updated = await service.updateContribution(
      'contribution-1',
      { amount: 75, note: '' },
      'admin-user',
    );

    expect(store.updateContribution).toHaveBeenCalledWith('contribution-1', {
      amount: 75,
      note: null,
      actorUserId: 'admin-user',
    });
    expect(updated).not.toBeNull();
    expect((updated as any).amount).toBe(75);
  });

  it('exports contributions to csv with filters', async () => {
    store.exportContributionsCsv.mockResolvedValue({ filename: 'giving.csv', content: 'data' } as any);

    const result = await service.exportContributionsCsv({ memberId: 'user-1' });

    expect(store.exportContributionsCsv).toHaveBeenCalledWith({ memberId: 'user-1' });
    expect(result.filename).toBe('giving.csv');
  });
});
