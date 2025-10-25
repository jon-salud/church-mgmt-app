import { GivingClient } from './giving-client';

type Contribution = {
  id: string;
  memberId: string;
  amount: number;
  date: string;
  fundId?: string | null;
  method: 'cash' | 'bank-transfer' | 'eftpos' | 'other';
};

type Fund = { id: string; name: string };

function deriveGivingSummary(contributions: Contribution[], funds: Fund[]) {
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
    name: fundId === 'general' ? 'General' : (fundMap.get(fundId) ?? fundId),
    amount,
  }));

  const monthly = Array.from(monthTotals.entries())
    .map(([month, amount]) => ({ month, amount }))
    .sort((a, b) => (a.month < b.month ? 1 : -1))
    .slice(0, 6);

  return { totals, byFund, monthly };
}

export default async function GivingPage() {
  // Demo data for static export
  const funds = [
    { id: 'general', name: 'General Fund' },
    { id: 'missions', name: 'Missions' },
    { id: 'building', name: 'Building Fund' },
  ];

  const contributions: Contribution[] = [
    {
      id: '1',
      memberId: '1',
      amount: 150.0,
      date: '2024-01-07',
      fundId: 'general',
      method: 'cash',
    },
    {
      id: '2',
      memberId: '2',
      amount: 75.5,
      date: '2024-01-08',
      fundId: 'missions',
      method: 'bank-transfer',
    },
    {
      id: '3',
      memberId: '1',
      amount: 200.0,
      date: '2024-01-09',
      fundId: 'building',
      method: 'eftpos',
    },
    { id: '4', memberId: '3', amount: 50.0, date: '2024-01-10', fundId: null, method: 'other' },
  ];

  const members = [
    {
      id: '1',
      primaryEmail: 'john.doe@example.com',
      profile: { firstName: 'John', lastName: 'Doe' },
    },
    {
      id: '2',
      primaryEmail: 'jane.smith@example.com',
      profile: { firstName: 'Jane', lastName: 'Smith' },
    },
    {
      id: '3',
      primaryEmail: 'bob.johnson@example.com',
      profile: { firstName: 'Bob', lastName: 'Johnson' },
    },
  ];

  const summary = deriveGivingSummary(contributions, funds);

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
