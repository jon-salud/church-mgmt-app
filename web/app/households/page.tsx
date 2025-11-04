import { api } from '../../lib/api.server';
import { HouseholdsClient } from './households-client';

export default async function HouseholdsPage() {
  const [households, deletedHouseholds, user] = await Promise.all([
    api.households(),
    api.listDeletedHouseholds().catch(err => {
      console.error('Failed to load deleted households:', err);
      return [];
    }),
    api
      .currentUser()
      .then(data => data?.user || null)
      .catch(() => null),
  ]);

  return (
    <HouseholdsClient households={households} deletedHouseholds={deletedHouseholds} user={user} />
  );
}
