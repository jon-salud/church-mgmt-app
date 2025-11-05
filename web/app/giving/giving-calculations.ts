import type { Contribution, Fund, GivingSummary } from '@/lib/types';

/**
 * Calculate giving summary from contributions.
 * Excludes archived (soft-deleted) contributions from all calculations.
 *
 * @param contributions - Array of contributions (should be pre-filtered to exclude deletedAt)
 * @param funds - Array of funds for name lookups
 * @returns GivingSummary object with totals, by-fund breakdown, and monthly trends
 */
export function calculateGivingSummary(
  contributions: Contribution[],
  funds: Fund[]
): GivingSummary {
  // Filter out any archived contributions as a safety measure
  const activeContributions = contributions.filter(c => !c.deletedAt);

  const totals = {
    overall: 0,
    monthToDate: 0,
    previousMonth: 0,
    averageGift: 0,
  };

  const monthKey = (value: Date) =>
    `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}`;

  const now = new Date();
  const currentMonth = monthKey(now);
  const previousMonth = monthKey(new Date(now.getFullYear(), now.getMonth() - 1, 1));

  const monthTotals = new Map<string, number>();
  const fundTotals = new Map<string, number>();
  const fundMap = new Map(funds.map(fund => [fund.id, fund.name]));

  for (const contribution of activeContributions) {
    const amount = Number(contribution.amount) || 0;
    totals.overall += amount;

    const date = new Date(contribution.date);
    const key = monthKey(date);
    monthTotals.set(key, (monthTotals.get(key) ?? 0) + amount);

    const fundKey = contribution.fundId ?? 'general';
    fundTotals.set(fundKey, (fundTotals.get(fundKey) ?? 0) + amount);
  }

  totals.monthToDate = monthTotals.get(currentMonth) ?? 0;
  totals.previousMonth = monthTotals.get(previousMonth) ?? 0;
  totals.averageGift =
    activeContributions.length > 0 ? totals.overall / activeContributions.length : 0;

  const byFund = Array.from(fundTotals.entries()).map(([fundId, amount]) => ({
    fundId: fundId === 'general' ? null : fundId,
    name: fundId === 'general' ? 'General' : (fundMap.get(fundId) ?? fundId),
    amount,
  }));

  const monthly = Array.from(monthTotals.entries())
    .map(([month, amount]) => ({ month, amount }))
    .sort((a, b) => (a.month < b.month ? 1 : -1))
    .slice(0, 6);

  return { totals, byFund, monthly };
}
