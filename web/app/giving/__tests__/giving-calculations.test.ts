import { describe, expect, it } from 'vitest';
import { calculateGivingSummary } from '../giving-calculations';
import type { Contribution, Fund } from '@/lib/types';

describe('calculateGivingSummary', () => {
  const mockFunds: Fund[] = [
    { id: 'fund-1', name: 'Building Fund' },
    { id: 'fund-2', name: 'Missions Fund' },
  ];

  it('should exclude archived contributions from all calculations', () => {
    const contributions: Contribution[] = [
      {
        id: '1',
        memberId: 'user-1',
        amount: 100,
        date: '2025-01-15T00:00:00Z',
        method: 'cash',
        deletedAt: null,
      },
      {
        id: '2',
        memberId: 'user-2',
        amount: 50,
        date: '2025-01-15T00:00:00Z',
        method: 'cash',
        deletedAt: '2025-01-20T00:00:00Z', // Archived
      },
    ];

    const summary = calculateGivingSummary(contributions, mockFunds);

    expect(summary.totals.overall).toBe(100); // Only active contribution
    expect(summary.totals.averageGift).toBe(100); // Only active contribution
  });

  it('should calculate month-to-date totals correctly', () => {
    const now = new Date();
    const contributions: Contribution[] = [
      {
        id: '1',
        memberId: 'user-1',
        amount: 100,
        date: now.toISOString(),
        method: 'cash',
        deletedAt: null,
      },
      {
        id: '2',
        memberId: 'user-2',
        amount: 75,
        date: now.toISOString(),
        method: 'cash',
        deletedAt: null,
      },
    ];

    const summary = calculateGivingSummary(contributions, mockFunds);

    expect(summary.totals.monthToDate).toBe(175);
  });

  it('should group contributions by fund correctly', () => {
    const contributions: Contribution[] = [
      {
        id: '1',
        memberId: 'user-1',
        amount: 100,
        date: '2025-01-15T00:00:00Z',
        fundId: 'fund-1',
        method: 'cash',
        deletedAt: null,
      },
      {
        id: '2',
        memberId: 'user-2',
        amount: 50,
        date: '2025-01-15T00:00:00Z',
        fundId: 'fund-1',
        method: 'cash',
        deletedAt: null,
      },
      {
        id: '3',
        memberId: 'user-3',
        amount: 25,
        date: '2025-01-15T00:00:00Z',
        fundId: null, // General fund
        method: 'cash',
        deletedAt: null,
      },
    ];

    const summary = calculateGivingSummary(contributions, mockFunds);

    const buildingFund = summary.byFund.find(f => f.fundId === 'fund-1');
    const generalFund = summary.byFund.find(f => f.fundId === null);

    expect(buildingFund?.amount).toBe(150);
    expect(generalFund?.amount).toBe(25);
  });

  it('should handle empty contributions array', () => {
    const summary = calculateGivingSummary([], mockFunds);

    expect(summary.totals.overall).toBe(0);
    expect(summary.totals.averageGift).toBe(0);
    expect(summary.byFund).toHaveLength(0);
    expect(summary.monthly).toHaveLength(0);
  });

  it('should recalculate correctly when contributions are restored', () => {
    // Simulate restored contribution (deletedAt removed)
    const contributions: Contribution[] = [
      {
        id: '1',
        memberId: 'user-1',
        amount: 100,
        date: '2025-01-15T00:00:00Z',
        method: 'cash',
        deletedAt: null, // Was archived, now restored
      },
      {
        id: '2',
        memberId: 'user-2',
        amount: 50,
        date: '2025-01-15T00:00:00Z',
        method: 'cash',
        deletedAt: null,
      },
    ];

    const summary = calculateGivingSummary(contributions, mockFunds);

    expect(summary.totals.overall).toBe(150);
    expect(summary.totals.averageGift).toBe(75);
  });

  it('should handle contributions with undefined fundId as general fund', () => {
    const contributions: Contribution[] = [
      {
        id: '1',
        memberId: 'user-1',
        amount: 100,
        date: '2025-01-15T00:00:00Z',
        method: 'cash',
        deletedAt: null,
        // fundId undefined (not set)
      },
    ];

    const summary = calculateGivingSummary(contributions, mockFunds);

    const generalFund = summary.byFund.find(f => f.fundId === null);
    expect(generalFund?.name).toBe('General');
    expect(generalFund?.amount).toBe(100);
  });
});
