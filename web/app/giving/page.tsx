import { api } from '../../lib/api.server';
import { GivingClient } from './giving-client';
import { calculateGivingSummary } from './giving-calculations';
import type { Contribution, Fund } from '../../lib/types';

export default async function GivingPage() {
  const [funds, deletedFunds, contributions, deletedContributions, members, user] =
    await Promise.all([
      api.funds(),
      api.listDeletedFunds().catch(() => []),
      api.contributions(),
      api.listDeletedContributions().catch(() => []),
      api.members(),
      api
        .currentUser()
        .then(data => data?.user || null)
        .catch(() => null),
    ]);

  let summary;
  try {
    summary = await api.givingSummary();
  } catch {
    summary = calculateGivingSummary(contributions as Contribution[], funds as Fund[]);
  }

  return (
    <GivingClient
      funds={funds}
      deletedFunds={deletedFunds}
      contributions={contributions}
      deletedContributions={deletedContributions}
      members={members}
      user={user}
      summary={summary}
      csvUrl="/api/giving/contributions/csv"
    />
  );
}
