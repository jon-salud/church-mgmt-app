import { api } from '../../lib/api.server';
import { AnnouncementsClient } from './announcements-client';

export default async function AnnouncementsPage() {
  const [announcements, groups, deletedAnnouncements, user] = await Promise.all([
    api.announcements(),
    api.groups(),
    api.listDeletedAnnouncements().catch(() => []),
    api
      .currentUser()
      .then(data => data?.user || null)
      .catch(() => null),
  ]);
  return (
    <AnnouncementsClient
      announcements={announcements}
      groups={groups}
      deletedAnnouncements={deletedAnnouncements}
      user={user}
    />
  );
}
