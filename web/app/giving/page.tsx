import { api } from '../../lib/api.server';
import { GivingClient } from './giving-client';
import { calculateGivingSummary } from './giving-calculations';
import type { Contribution, Fund } from '../../lib/types';

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
    summary = calculateGivingSummary(contributions as Contribution[], funds as Fund[]);
  }

  // Note: deletedFunds and deletedContributions will be passed to GivingClient in Phase 4E
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
