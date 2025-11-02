import { api } from '../../lib/api.server';
import { GroupsClient } from './groups-client';

export default async function GroupsPage() {
  const [groups, deletedGroups, user] = await Promise.all([
    api.groups(),
    api.listDeletedGroups().catch(() => []),
    api
      .currentUser()
      .then(data => data?.user || null)
      .catch(() => null),
  ]);

  return <GroupsClient groups={groups} deletedGroups={deletedGroups} user={user} />;
}
