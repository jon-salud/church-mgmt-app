import { api } from '../../lib/api.server';
import { GivingClient } from './giving-client';

type Contribution = {
  id: string;
  memberId: string;
  amount: number;
  date: string;
  fundId?: string | null;
};

type Fund = { id: string; name: string };

function deriveGivingSummary(contributions: Contribution[], funds: Fund[]) {
  const totals = {
    overall: 0,
    monthToDate: 0,
    previousMonth: 0,
    averageGift: 0,
  };
  const monthKey = (value: Date) => `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}`;
  const now = new Date();
  const currentMonth = monthKey(now);
  const previousMonth = monthKey(new Date(now.getFullYear(), now.getMonth() - 1, 1));

  const monthTotals = new Map<string, number>();
  const fundTotals = new Map<string, number>();
  const fundMap = new Map(funds.map(fund => [fund.id, fund.name]));

  for (const contribution of contributions) {
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
  totals.averageGift = contributions.length > 0 ? totals.overall / contributions.length : 0;

  const byFund = Array.from(fundTotals.entries()).map(([fundId, amount]) => ({
    fundId: fundId === 'general' ? null : fundId,
    name: fundId === 'general' ? 'General' : fundMap.get(fundId) ?? fundId,
    amount,
  }));

  const monthly = Array.from(monthTotals.entries())
    .map(([month, amount]) => ({ month, amount }))
    .sort((a, b) => (a.month < b.month ? 1 : -1))
    .slice(0, 6);

  return { totals, byFund, monthly };
}

export default async function GivingPage() {
  const [funds, contributions, members] = await Promise.all([
    api.funds(),
    api.contributions(),
    api.members(),
  ]);

  let summary;
  try {
    summary = await api.givingSummary();
  } catch {
    summary = deriveGivingSummary(contributions, funds);
  }

  return (
    <GivingClient
      funds={funds}
      contributions={contributions}
      members={members}
      summary={summary}
      csvUrl="/api/giving/contributions/csv"
    />
  );
}
