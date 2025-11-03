import { GivingService } from '../../src/modules/giving/giving.service';
import { IGivingRepository } from '../../src/modules/giving/giving.repository.interface';
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('GivingService', () => {
  const createRepositoryMock = (): IGivingRepository & Record<string, any> => ({
    listFunds: vi.fn(),
    listDeletedFunds: vi.fn(),
    createFund: vi.fn(),
    updateFund: vi.fn(),
    deleteFund: vi.fn(),
    hardDeleteFund: vi.fn(),
    undeleteFund: vi.fn(),
    bulkDeleteFunds: vi.fn(),
    bulkUndeleteFunds: vi.fn(),
    getFundById: vi.fn(),
    listContributions: vi.fn(),
    listDeletedContributions: vi.fn(),
    recordContribution: vi.fn(),
    updateContribution: vi.fn(),
    getContributionById: vi.fn(),
    deleteContribution: vi.fn(),
    hardDeleteContribution: vi.fn(),
    undeleteContribution: vi.fn(),
    bulkDeleteContributions: vi.fn(),
    bulkUndeleteContributions: vi.fn(),
    getGivingSummary: vi.fn(),
    exportContributionsCsv: vi.fn(),
  });

  const repo = createRepositoryMock();
  const service = new GivingService(repo);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns funds from the datastore', async () => {
    const funds = [{ id: 'fund-1' }];
    repo.listFunds.mockResolvedValue(funds as any);

    const result = await service.listFunds();

    expect(result).toEqual(funds);
    expect(repo.listFunds).toHaveBeenCalledTimes(1);
  });

  it('filters contributions through datastore', async () => {
    repo.listContributions.mockResolvedValue([{ id: 'contribution-1' }] as any);

    const result = await service.listContributions({ memberId: 'user-1' });

    expect(repo.listContributions).toHaveBeenCalledWith({ memberId: 'user-1' });
    expect(result[0].id).toBe('contribution-1');
  });

  it('records contribution attributing actor when provided', async () => {
    const contribution = { id: 'contribution-new' };
    repo.recordContribution.mockResolvedValue(contribution as any);

    const result = await service.recordContribution(
      {
        memberId: 'user-1',
        amount: 42,
        date: '2024-03-01',
        method: 'cash' as const,
      },
      'admin-user'
    );

    expect(repo.recordContribution).toHaveBeenCalledWith({
      memberId: 'user-1',
      amount: 42,
      date: '2024-03-01',
      method: 'cash',
      recordedBy: 'admin-user',
    });
    expect(result).toEqual(contribution);
  });

  it('provides giving summary for the current church', async () => {
    repo.getGivingSummary.mockResolvedValue({ totals: { overall: 100 } } as any);

    const summary = await service.summary();

    expect(repo.getGivingSummary).toHaveBeenCalled();
    expect(summary.totals.overall).toBe(100);
  });

  it('updates contributions via datastore with cleanup helpers', async () => {
    repo.updateContribution.mockResolvedValue({ id: 'contribution-1', amount: 75 } as any);

    const updated = await service.updateContribution(
      'contribution-1',
      { amount: 75, note: '' },
      'admin-user'
    );

    expect(repo.updateContribution).toHaveBeenCalledWith('contribution-1', {
      amount: 75,
      note: null,
      actorUserId: 'admin-user',
    });
    expect(updated).not.toBeNull();
    expect((updated as any).amount).toBe(75);
  });

  it('exports contributions to csv with filters', async () => {
    repo.exportContributionsCsv.mockResolvedValue({
      filename: 'giving.csv',
      content: 'data',
    } as any);

    const result = await service.exportContributionsCsv({ memberId: 'user-1' });

    expect(repo.exportContributionsCsv).toHaveBeenCalledWith({ memberId: 'user-1' });
    expect(result.filename).toBe('giving.csv');
  });
});
